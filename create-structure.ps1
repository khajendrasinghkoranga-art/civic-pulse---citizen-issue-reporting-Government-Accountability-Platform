$basePath = "apps\citizen-web"
$dirs = @(
    "app\login", "app\register", "app\verify-otp", "app\dashboard", "app\report",
    "app\issues\[id]", "app\notifications", "app\community\[id]",
    "app\feedback\[issueId]", "app\profile", "app\transparency",
    "components\ui", "components\layout", "components\auth", "components\dashboard",
    "components\issues", "components\location", "components\evidence", "components\notifications",
    "components\community", "components\feedback", "components\transparency",
    "services", "hooks", "lib", "types", "public\images", "public\icons", "public\logos"
)

foreach ($dir in $dirs) {
    New-Item -Path "$basePath\$dir" -ItemType Directory -Force | Out-Null
}

$files = @(
    "app\layout.tsx", "app\page.tsx", "app\globals.css",
    "app\login\page.tsx", "app\register\page.tsx", "app\verify-otp\page.tsx",
    "app\dashboard\page.tsx", "app\report\page.tsx",
    "app\issues\page.tsx", "app\issues\[id]\page.tsx",
    "app\notifications\page.tsx",
    "app\community\page.tsx", "app\community\[id]\page.tsx",
    "app\feedback\[issueId]\page.tsx",
    "app\profile\page.tsx", "app\transparency\page.tsx",
    "services\api.ts", "services\auth.service.ts", "services\issue.service.ts",
    "services\upload.service.ts", "services\notification.service.ts",
    "services\community.service.ts", "services\feedback.service.ts",
    "services\user.service.ts", "services\transparency.service.ts",
    "hooks\useAuth.ts", "hooks\useIssues.ts", "hooks\useIssue.ts",
    "hooks\useLocation.ts", "hooks\useUpload.ts", "hooks\useNotifications.ts",
    "hooks\useCommunity.ts",
    "lib\api-client.ts", "lib\auth.ts", "lib\constants.ts", "lib\utils.ts",
    "lib\validators.ts", "lib\storage.ts",
    "types\auth.ts", "types\user.ts", "types\issue.ts", "types\notification.ts",
    "types\community.ts", "types\feedback.ts", "types\transparency.ts",
    "middleware.ts", "package.json", "tsconfig.json", "next.config.ts", ".env.local"
)

foreach ($file in $files) {
    New-Item -Path "$basePath\$file" -ItemType File -Force | Out-Null
}

Set-Content -Path "$basePath\package.json" -Value "{}"
