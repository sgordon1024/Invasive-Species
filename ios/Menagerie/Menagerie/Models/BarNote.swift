import Foundation

/// A note a drinker pinned next to a specimen. The backend only ever returns
/// notes younger than 24 hours, so anything we hold is "live".
struct BarNote: Codable, Identifiable, Hashable {
    let id: UUID
    let specimenId: String
    let authorName: String?
    let body: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case specimenId = "specimen_id"
        case authorName = "author_name"
        case body
        case createdAt = "created_at"
    }
}
