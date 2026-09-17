import CoreLocation
import SwiftUI
import UIKit

/// Shown before location permission has been asked for.
struct LocationPermissionView: View {
    let onRequest: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "pawprint.fill")
                .font(.system(size: 44))
                .foregroundStyle(.green)
            Text("Welcome to the Menagerie")
                .font(.title2.bold())
            Text("The critters mounted around Invasive Species Brewing have stories to tell — but only in person. We need your location just to check you're at the bar.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Button("Check me in", action: onRequest)
                .buttonStyle(.borderedProminent)
                .padding(.top, 8)
        }
        .padding(32)
    }
}

/// Shown when location permission was denied.
struct LocationDeniedView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "location.slash")
                .font(.system(size: 44))
                .foregroundStyle(.secondary)
            Text("Can't check you in")
                .font(.title2.bold())
            Text("Without location access we can't tell you're at the bar, and the menagerie stays asleep. You can grant it in Settings.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Button("Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.bordered)
            .padding(.top, 8)
        }
        .padding(32)
    }
}

/// Shown when the drinker is anywhere that isn't the bar.
struct OutsideBarView: View {
    @ObservedObject var geofence: GeofenceService
    let venue: Venue

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "mappin.and.ellipse")
                .font(.system(size: 44))
                .foregroundStyle(.green)
            Text("The menagerie is asleep")
                .font(.title2.bold())
            Text("These critters only talk inside \(venue.name). Come grab a stool at 726 NE 2nd Ave and try again.")
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            if let distance = geofence.distanceToBar {
                Text("You're \(Self.format(distance)) from the taps.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            #if DEBUG
            Button("Sneak past the bouncer (demo mode)") {
                geofence.debugOverride = true
            }
            .buttonStyle(.bordered)
            .padding(.top, 12)
            #endif
        }
        .padding(32)
    }

    private static func format(_ meters: CLLocationDistance) -> String {
        meters < 1000 ? "\(Int(meters)) m" : String(format: "%.1f km", meters / 1000)
    }
}
