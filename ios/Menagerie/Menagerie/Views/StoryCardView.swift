import SwiftUI

/// The story + ephemeral notes card for one specimen. Used both as the AR
/// slide-up panel and as the detail screen in demo / field-guide mode.
struct StoryCardView: View {
    let specimen: Specimen
    var bridge: ARBridge? = nil

    @EnvironmentObject private var notesService: NotesService
    @State private var notes: [BarNote] = []
    @State private var noteText = ""
    @State private var authorName = DeviceIdentity.handle
    @State private var isPosting = false
    @State private var errorMessage: String?

    private let bodyLimit = 240

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    header
                    Text(specimen.story)
                        .font(.callout)
                        .fixedSize(horizontal: false, vertical: true)
                    Divider()
                    notesSection
                }
                .padding(20)
            }
            composer
        }
        .frame(maxHeight: 460)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28))
        .padding(.horizontal, 12)
        .padding(.bottom, 8)
        .task(id: specimen.id) { await refresh() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(specimen.name)
                .font(.title2.bold())
            Text("\(specimen.species) · \(specimen.origin)")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    @ViewBuilder
    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Notes on the wall", systemImage: "note.text")
                    .font(.subheadline.bold())
                Spacer()
                Text("gone in 24h")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            if !notesService.isConfigured {
                Text("The corkboard isn't wired up yet — add Supabase credentials to turn on notes.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if notes.isEmpty {
                Text("Nothing here yet. Leave your mark — it fades by this time tomorrow.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(notes) { note in
                    noteRow(note)
                }
            }
            if let errorMessage {
                Text(errorMessage)
                    .font(.caption2)
                    .foregroundStyle(.red)
            }
        }
    }

    private func noteRow(_ note: BarNote) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 6) {
                Text(note.authorName ?? "Anonymous barfly")
                    .font(.caption.bold())
                Text(Self.relativeFormatter.localizedString(for: note.createdAt, relativeTo: .now))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Text(note.body)
                .font(.callout)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .contextMenu {
            Button(role: .destructive) {
                report(note)
            } label: {
                Label("Flag this note", systemImage: "flag")
            }
        }
    }

    private var composer: some View {
        VStack(spacing: 8) {
            Divider()
            HStack(spacing: 8) {
                TextField("Your name (optional)", text: $authorName)
                    .textFieldStyle(.plain)
                    .font(.caption)
                    .frame(maxWidth: 130)
                TextField("Leave a note for the next barfly…", text: $noteText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .font(.callout)
                    .lineLimit(1...3)
                Button(action: postNote) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                }
                .disabled(
                    isPosting
                    || !notesService.isConfigured
                    || noteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                )
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
        }
    }

    private func refresh() async {
        guard notesService.isConfigured else { return }
        do {
            notes = try await notesService.notes(for: specimen.id)
            bridge?.renderNotes?(specimen.id, notes)
        } catch {
            errorMessage = "Couldn't fetch notes: \(error.localizedDescription)"
        }
    }

    private func postNote() {
        let trimmed = noteText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !isPosting else { return }
        isPosting = true
        errorMessage = nil
        let author = authorName.trimmingCharacters(in: .whitespacesAndNewlines)
        DeviceIdentity.handle = author
        Task {
            do {
                try await notesService.post(
                    body: String(trimmed.prefix(bodyLimit)),
                    author: author.isEmpty ? nil : author,
                    specimenId: specimen.id
                )
                noteText = ""
                await refresh()
            } catch {
                errorMessage = error.localizedDescription
            }
            isPosting = false
        }
    }

    private func report(_ note: BarNote) {
        Task {
            try? await notesService.report(noteId: note.id)
            notes.removeAll { $0.id == note.id }
        }
    }

    private static let relativeFormatter = RelativeDateTimeFormatter()
}
