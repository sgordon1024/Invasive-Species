import CoreLocation
import Foundation

struct Venue: Codable, Hashable {
    let name: String
    let latitude: Double
    let longitude: Double
    let radiusMeters: Double

    var center: CLLocation {
        CLLocation(latitude: latitude, longitude: longitude)
    }
}

struct Specimen: Codable, Identifiable, Hashable {
    let id: String
    /// The house name regulars know it by, e.g. "Vlad".
    let name: String
    let species: String
    let origin: String
    let story: String
    /// Filename of the detection photo bundled in Resources/Detection (nil until photographed).
    let imageName: String?
    /// Real-world width of whatever the detection photo shows, in meters — ARKit needs it for scale.
    let physicalWidthMeters: Double?
}

struct SpecimenCatalog: Codable {
    let venue: Venue
    let specimens: [Specimen]

    static let shared = load()

    static func load() -> SpecimenCatalog {
        guard let url = Bundle.main.url(forResource: "specimens", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let catalog = try? JSONDecoder().decode(SpecimenCatalog.self, from: data)
        else {
            fatalError("specimens.json is missing or malformed — it must ship in the app bundle")
        }
        return catalog
    }

    func specimen(withId id: String) -> Specimen? {
        specimens.first { $0.id == id }
    }
}
