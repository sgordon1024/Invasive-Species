import ARKit
import SwiftUI

struct RootView: View {
    private let catalog = SpecimenCatalog.shared
    @StateObject private var geofence = GeofenceService()
    @StateObject private var notesService = NotesService()

    var body: some View {
        Group {
            if geofence.debugOverride || geofence.isInsideBar {
                experience
            } else {
                switch geofence.authorization {
                case .notDetermined:
                    LocationPermissionView { geofence.requestPermission() }
                case .denied, .restricted:
                    LocationDeniedView()
                default:
                    OutsideBarView(geofence: geofence, venue: catalog.venue)
                }
            }
        }
        .environmentObject(notesService)
        .onAppear { geofence.start(venue: catalog.venue) }
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private var experience: some View {
        if ARWorldTrackingConfiguration.isSupported {
            ARExperienceView(catalog: catalog)
        } else {
            // Simulator (or an ancient device): same stories and notes, no camera.
            DemoModeView(catalog: catalog)
        }
    }
}
