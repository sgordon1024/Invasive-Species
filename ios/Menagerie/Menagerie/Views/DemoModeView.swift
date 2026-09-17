import SwiftUI

/// Browsable list of every mounted resident. Doubles as the whole experience on
/// the Simulator (no AR camera there) and as the "Field Guide" sheet in AR mode.
struct DemoModeView: View {
    let catalog: SpecimenCatalog
    var isEmbedded = false

    var body: some View {
        NavigationStack {
            List(catalog.specimens) { specimen in
                NavigationLink(value: specimen) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(specimen.name)
                            .font(.headline)
                        Text(specimen.species)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle(isEmbedded ? "Field Guide" : "The Menagerie")
            .navigationDestination(for: Specimen.self) { specimen in
                ScrollView {
                    StoryCardView(specimen: specimen)
                        .padding(.top, 8)
                }
                .navigationTitle(specimen.name)
                .navigationBarTitleDisplayMode(.inline)
            }
        }
    }
}
