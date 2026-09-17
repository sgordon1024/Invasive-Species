import ARKit
import RealityKit
import SwiftUI
import simd

/// The camera view: world tracking + image detection. Each specimen's bundled
/// detection photo becomes an ARReferenceImage at runtime; when one is spotted
/// we drop a glowing marker on it, and when the drinker walks within arm's-ish
/// reach the bridge publishes the specimen so SwiftUI can slide the story up.
struct ARSpecimenView: UIViewRepresentable {
    let catalog: SpecimenCatalog
    @ObservedObject var bridge: ARBridge

    func makeUIView(context: Context) -> ARView {
        let arView = ARView(frame: .zero)
        context.coordinator.attach(to: arView, catalog: catalog, bridge: bridge)
        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, ARSessionDelegate {
        private weak var arView: ARView?
        private var catalog: SpecimenCatalog?
        private var bridge: ARBridge?
        private var anchorEntities: [String: AnchorEntity] = [:]
        private var noteEntities: [String: [Entity]] = [:]
        private var billboards: [Entity] = []
        private var lastProximityCheck = Date.distantPast

        /// Walk closer than this and the story card appears…
        private let enterDistance: Float = 1.6
        /// …and it stays up until you back off past this (hysteresis).
        private let exitDistance: Float = 2.4

        func attach(to arView: ARView, catalog: SpecimenCatalog, bridge: ARBridge) {
            self.arView = arView
            self.catalog = catalog
            self.bridge = bridge
            bridge.renderNotes = { [weak self] specimenId, notes in
                self?.showNotes(notes, forSpecimen: specimenId)
            }

            let configuration = ARWorldTrackingConfiguration()
            configuration.detectionImages = Self.referenceImages(for: catalog)
            configuration.maximumNumberOfTrackedImages = 4
            configuration.environmentTexturing = .automatic
            arView.session.delegate = self
            arView.session.run(configuration)
        }

        /// Builds ARKit reference images at runtime from the photos bundled in
        /// Resources/Detection, so adding a mount never touches an asset catalog.
        static func referenceImages(for catalog: SpecimenCatalog) -> Set<ARReferenceImage> {
            var images = Set<ARReferenceImage>()
            for specimen in catalog.specimens {
                guard let imageName = specimen.imageName,
                      let uiImage = UIImage(named: imageName) ?? loadLooseImage(named: imageName),
                      let cgImage = uiImage.cgImage
                else { continue }
                let width = CGFloat(specimen.physicalWidthMeters ?? 0.4)
                let reference = ARReferenceImage(cgImage, orientation: .up, physicalWidth: width)
                reference.name = specimen.id
                images.insert(reference)
            }
            return images
        }

        private static func loadLooseImage(named name: String) -> UIImage? {
            let base = (name as NSString).deletingPathExtension
            let ext = (name as NSString).pathExtension
            guard let url = Bundle.main.url(forResource: base, withExtension: ext.isEmpty ? "jpg" : ext) else {
                return nil
            }
            return UIImage(contentsOfFile: url.path)
        }

        // MARK: - ARSessionDelegate

        func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
            guard let arView, let catalog else { return }
            for anchor in anchors {
                guard let imageAnchor = anchor as? ARImageAnchor,
                      let specimenId = imageAnchor.referenceImage.name,
                      let specimen = catalog.specimen(withId: specimenId),
                      anchorEntities[specimenId] == nil
                else { continue }
                let entity = AnchorEntity(anchor: imageAnchor)
                entity.addChild(makeMarker(for: specimen))
                arView.scene.addAnchor(entity)
                anchorEntities[specimenId] = entity
            }
        }

        func session(_ session: ARSession, didUpdate frame: ARFrame) {
            let column = frame.camera.transform.columns.3
            let cameraPosition = SIMD3<Float>(column.x, column.y, column.z)
            billboard(toward: cameraPosition)
            checkProximity(cameraPosition: cameraPosition, frame: frame)
        }

        // MARK: - Proximity

        private func checkProximity(cameraPosition: SIMD3<Float>, frame: ARFrame) {
            let now = Date()
            guard now.timeIntervalSince(lastProximityCheck) > 0.25 else { return }
            lastProximityCheck = now
            guard let bridge, let catalog else { return }

            var nearest: (id: String, distance: Float)?
            for anchor in frame.anchors {
                guard let imageAnchor = anchor as? ARImageAnchor,
                      let specimenId = imageAnchor.referenceImage.name
                else { continue }
                let position = SIMD3<Float>(
                    imageAnchor.transform.columns.3.x,
                    imageAnchor.transform.columns.3.y,
                    imageAnchor.transform.columns.3.z
                )
                let distance = simd_distance(cameraPosition, position)
                if nearest == nil || distance < nearest!.distance {
                    nearest = (specimenId, distance)
                }
            }

            let enter = enterDistance
            let exit = exitDistance
            DispatchQueue.main.async {
                if let current = bridge.nearbySpecimen {
                    guard let nearest else {
                        bridge.nearbySpecimen = nil
                        return
                    }
                    if nearest.id == current.id {
                        if nearest.distance > exit { bridge.nearbySpecimen = nil }
                    } else if nearest.distance < enter {
                        bridge.nearbySpecimen = catalog.specimen(withId: nearest.id)
                    }
                } else if let nearest, nearest.distance < enter {
                    bridge.nearbySpecimen = catalog.specimen(withId: nearest.id)
                }
            }
        }

        // MARK: - Scene content

        /// Glowing orb + name tag floating just off the mount.
        private func makeMarker(for specimen: Specimen) -> Entity {
            let root = Entity()

            let orb = ModelEntity(
                mesh: .generateSphere(radius: 0.018),
                materials: [UnlitMaterial(color: UIColor.systemGreen)]
            )
            // Image anchors have +Y pointing out of the picture, so "up" here
            // means "off the wall, toward the room".
            orb.position = [0, 0.05, 0]
            root.addChild(orb)

            let label = makeText(specimen.name, size: 0.035, color: .white)
            label.position = [0, 0.11, 0]
            root.addChild(label)
            billboards.append(label)

            return root
        }

        /// Floats the freshest few notes next to the mount like AR sticky notes.
        private func showNotes(_ notes: [BarNote], forSpecimen specimenId: String) {
            guard let root = anchorEntities[specimenId] else { return }
            noteEntities[specimenId]?.forEach { $0.removeFromParent() }
            billboards.removeAll { $0.parent == nil }

            var floated: [Entity] = []
            for (index, note) in notes.prefix(4).enumerated() {
                let author = note.authorName ?? "someone"
                let text = "\(author): \(note.body.prefix(48))\(note.body.count > 48 ? "…" : "")"
                let bubble = makeText(text, size: 0.016, color: UIColor.systemYellow)
                bubble.position = [
                    index.isMultiple(of: 2) ? -0.16 : 0.16,
                    0.17 + Float(index) * 0.055,
                    0,
                ]
                root.addChild(bubble)
                billboards.append(bubble)
                floated.append(bubble)
            }
            noteEntities[specimenId] = floated
        }

        private func makeText(_ string: String, size: Float, color: UIColor) -> ModelEntity {
            let mesh = MeshResource.generateText(
                string,
                extrusionDepth: 0.001,
                font: .systemFont(ofSize: CGFloat(size), weight: .semibold),
                containerFrame: .zero,
                alignment: .center,
                lineBreakMode: .byTruncatingTail
            )
            let entity = ModelEntity(mesh: mesh, materials: [UnlitMaterial(color: color)])
            // generateText puts the origin at the baseline's left edge — recenter.
            let bounds = entity.visualBounds(relativeTo: entity)
            entity.position.x = -bounds.extents.x / 2
            return entity
        }

        /// Keeps every text entity facing the drinker.
        private func billboard(toward cameraPosition: SIMD3<Float>) {
            for entity in billboards where entity.parent != nil {
                let position = entity.position(relativeTo: nil)
                entity.look(at: cameraPosition, from: position, relativeTo: nil)
                // look(at:) points -Z at the target, but text faces +Z — flip it.
                entity.setOrientation(simd_quatf(angle: .pi, axis: [0, 1, 0]), relativeTo: entity)
            }
        }
    }
}
