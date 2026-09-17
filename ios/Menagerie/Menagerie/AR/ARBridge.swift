import Combine
import Foundation

/// Shared state between the RealityKit coordinator and SwiftUI.
final class ARBridge: ObservableObject {
    /// The specimen the drinker is currently standing near, if any.
    @Published var nearbySpecimen: Specimen?
    /// Set by the AR coordinator; SwiftUI calls it after fetching notes so the
    /// coordinator can float them next to the mount.
    var renderNotes: ((_ specimenId: String, _ notes: [BarNote]) -> Void)?
}
