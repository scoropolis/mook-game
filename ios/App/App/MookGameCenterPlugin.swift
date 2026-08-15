import Capacitor
import GameKit

@objc(MookGameCenterPlugin)
public class MookGameCenterPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "MookGameCenterPlugin"
    public let jsName = "MookGameCenter"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise)
    ]

    @objc func initialize(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func signIn(_ call: CAPPluginCall) {
        let player = GKLocalPlayer.local
        if player.isAuthenticated {
            call.resolve(["signedIn": true])
            return
        }

        let silent = call.getBool("silent") ?? true
        var finished = false
        player.authenticateHandler = { [weak self] viewController, error in
            guard !finished else { return }
            if let error {
                finished = true
                player.authenticateHandler = nil
                call.reject("Game Center sign-in failed", nil, error)
                return
            }
            if let viewController {
                if silent {
                    finished = true
                    player.authenticateHandler = nil
                    call.resolve(["signedIn": false])
                } else {
                    self?.bridge?.viewController?.present(viewController, animated: true)
                }
                return
            }
            finished = true
            player.authenticateHandler = nil
            call.resolve(["signedIn": player.isAuthenticated])
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.resolve()
            return
        }
        guard let leaderboardId = call.getString("leaderboardId"),
              let score = call.getInt("score") else {
            call.reject("leaderboardId and score are required")
            return
        }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [leaderboardId]) { error in
            if let error { call.reject("Score submission failed", nil, error) }
            else { call.resolve() }
        }
    }

    @objc func showLeaderboard(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else {
            call.reject("Game Center is not signed in")
            return
        }
        guard let leaderboardId = call.getString("leaderboardId") else {
            call.reject("leaderboardId is required")
            return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            let controller = GKGameCenterViewController(
                leaderboardID: leaderboardId,
                playerScope: .global,
                timeScope: .allTime
            )
            controller.gameCenterDelegate = self
            self.bridge?.viewController?.present(controller, animated: true) {
                call.resolve()
            }
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
