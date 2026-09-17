import SwiftUI

struct ARExperienceView: View {
    let catalog: SpecimenCatalog
    @StateObject private var bridge = ARBridge()
    @State private var showFieldGuide = false

    var body: some View {
        ZStack {
            ARSpecimenView(catalog: catalog, bridge: bridge)
                .ignoresSafeArea()

            VStack {
                HStack {
                    Spacer()
                    Button {
                        showFieldGuide = true
                    } label: {
                        Label("Field Guide", systemImage: "book.closed.fill")
                            .font(.footnote.bold())
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(.ultraThinMaterial, in: Capsule())
                    }
                    .tint(.primary)
                }
                .padding(.horizontal)

                Spacer()

                if let specimen = bridge.nearbySpecimen {
                    StoryCardView(specimen: specimen, bridge: bridge)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                } else {
                    Text("Wander up to one of our permanent residents…")
                        .font(.footnote)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(.ultraThinMaterial, in: Capsule())
                        .padding(.bottom, 24)
                }
            }
        }
        .animation(.spring(duration: 0.35), value: bridge.nearbySpecimen)
        .sheet(isPresented: $showFieldGuide) {
            DemoModeView(catalog: catalog, isEmbedded: true)
        }
    }
}
