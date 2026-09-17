import Foundation

/// Anonymous per-install identity: a stable UUID for rate limiting on the backend,
/// plus the last display name the person typed.
enum DeviceIdentity {
    private static let idKey = "menagerie.device.id"
    private static let handleKey = "menagerie.device.handle"

    static var id: UUID {
        if let raw = UserDefaults.standard.string(forKey: idKey), let uuid = UUID(uuidString: raw) {
            return uuid
        }
        let fresh = UUID()
        UserDefaults.standard.set(fresh.uuidString, forKey: idKey)
        return fresh
    }

    static var handle: String {
        get { UserDefaults.standard.string(forKey: handleKey) ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: handleKey) }
    }
}
