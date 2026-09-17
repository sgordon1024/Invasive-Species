import CoreLocation
import Foundation

/// Gates the whole experience on physically being at the bar.
final class GeofenceService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var authorization: CLAuthorizationStatus = .notDetermined
    @Published private(set) var distanceToBar: CLLocationDistance?
    @Published private(set) var isInsideBar = false
    /// Lets staff demo the app away from the bar (DEBUG builds only expose the button).
    @Published var debugOverride = false

    private let manager = CLLocationManager()
    private var venue: Venue?
    /// Once inside, allow this much extra distance before kicking someone out,
    /// so the gate doesn't flap for people on the patio edge.
    private let exitSlackMeters: CLLocationDistance = 40

    func start(venue: Venue) {
        self.venue = venue
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 5
        authorization = manager.authorizationStatus
        if authorization == .authorizedWhenInUse || authorization == .authorizedAlways {
            manager.startUpdatingLocation()
        }
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    // MARK: - CLLocationManagerDelegate

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        DispatchQueue.main.async {
            self.authorization = status
        }
        if status == .authorizedWhenInUse || status == .authorizedAlways {
            manager.startUpdatingLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let venue, let latest = locations.last else { return }
        let distance = latest.distance(from: venue.center)
        DispatchQueue.main.async {
            self.distanceToBar = distance
            if self.isInsideBar {
                self.isInsideBar = distance <= venue.radiusMeters + self.exitSlackMeters
            } else {
                self.isInsideBar = distance <= venue.radiusMeters
            }
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // Transient location errors are fine — we just keep the last known state.
    }
}
