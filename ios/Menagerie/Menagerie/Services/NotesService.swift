import Foundation

/// Talks straight to Supabase's PostgREST API — two endpoints and an RPC,
/// so no SDK dependency is worth it. Credentials come from Resources/Supabase.plist;
/// when they're blank the app runs fine with notes disabled.
final class NotesService: ObservableObject {
    struct Config {
        let url: URL
        let anonKey: String
    }

    let config: Config?
    var isConfigured: Bool { config != nil }

    init() {
        guard let plistURL = Bundle.main.url(forResource: "Supabase", withExtension: "plist"),
              let data = try? Data(contentsOf: plistURL),
              let dict = try? PropertyListSerialization.propertyList(from: data, format: nil) as? [String: String],
              let urlString = dict["SupabaseURL"], !urlString.isEmpty,
              let anonKey = dict["SupabaseAnonKey"], !anonKey.isEmpty,
              let url = URL(string: urlString)
        else {
            config = nil
            return
        }
        config = Config(url: url, anonKey: anonKey)
    }

    /// Live notes for one specimen. The backend's row-level security already
    /// filters out anything older than 24 hours or flagged off the wall.
    func notes(for specimenId: String) async throws -> [BarNote] {
        guard let config else { return [] }
        var components = URLComponents(
            url: config.url.appendingPathComponent("rest/v1/ar_notes"),
            resolvingAgainstBaseURL: false
        )!
        components.queryItems = [
            URLQueryItem(name: "specimen_id", value: "eq.\(specimenId)"),
            URLQueryItem(name: "select", value: "id,specimen_id,author_name,body,created_at"),
            URLQueryItem(name: "order", value: "created_at.desc"),
            URLQueryItem(name: "limit", value: "50"),
        ]
        var request = URLRequest(url: components.url!)
        authorize(&request, config: config)
        let (data, response) = try await URLSession.shared.data(for: request)
        try Self.checkOK(response, data: data)
        return try Self.decoder.decode([BarNote].self, from: data)
    }

    func post(body: String, author: String?, specimenId: String) async throws {
        guard let config else { throw NotesError.notConfigured }
        var request = URLRequest(url: config.url.appendingPathComponent("rest/v1/ar_notes"))
        request.httpMethod = "POST"
        authorize(&request, config: config)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        var payload: [String: String] = [
            "specimen_id": specimenId,
            "body": body,
            "device_id": DeviceIdentity.id.uuidString,
        ]
        if let author, !author.isEmpty {
            payload["author_name"] = author
        }
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        let (data, response) = try await URLSession.shared.data(for: request)
        try Self.checkOK(response, data: data)
    }

    /// Three flags from different people hides a note (see migration 004).
    func report(noteId: UUID) async throws {
        guard let config else { throw NotesError.notConfigured }
        var request = URLRequest(url: config.url.appendingPathComponent("rest/v1/rpc/report_ar_note"))
        request.httpMethod = "POST"
        authorize(&request, config: config)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["note_id": noteId.uuidString])
        let (data, response) = try await URLSession.shared.data(for: request)
        try Self.checkOK(response, data: data)
    }

    private func authorize(_ request: inout URLRequest, config: Config) {
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
    }

    private static func checkOK(_ response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else {
            throw NotesError.badResponse("Not an HTTP response")
        }
        guard (200..<300).contains(http.statusCode) else {
            let detail = String(data: data, encoding: .utf8) ?? ""
            throw NotesError.badResponse("HTTP \(http.statusCode) \(detail)")
        }
    }

    static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let raw = try decoder.singleValueContainer().decode(String.self)
            for formatter in postgresFormatters {
                if let date = formatter.date(from: raw) { return date }
            }
            throw DecodingError.dataCorrupted(.init(
                codingPath: decoder.codingPath,
                debugDescription: "Unparseable timestamp: \(raw)"
            ))
        }
        return decoder
    }()

    /// PostgREST emits e.g. 2026-09-16T18:04:11.482716+00:00 with a varying
    /// number of fractional digits, which ISO8601DateFormatter chokes on.
    private static let postgresFormatters: [DateFormatter] = {
        ["yyyy-MM-dd'T'HH:mm:ss.SSSSSSZZZZZ",
         "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ",
         "yyyy-MM-dd'T'HH:mm:ssZZZZZ"].map { format in
            let formatter = DateFormatter()
            formatter.locale = Locale(identifier: "en_US_POSIX")
            formatter.timeZone = TimeZone(identifier: "UTC")
            formatter.dateFormat = format
            return formatter
        }
    }()
}

enum NotesError: LocalizedError {
    case notConfigured
    case badResponse(String)

    var errorDescription: String? {
        switch self {
        case .notConfigured:
            return "Notes backend isn't configured yet."
        case .badResponse(let detail):
            return detail
        }
    }
}
