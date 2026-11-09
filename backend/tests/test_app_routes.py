from app.main import app


EXPECTED_PATHS = {
    "/",
    "/auth/register",
    "/auth/login",
    "/auth/me",
    "/auth/admin/overview",
    "/auth/admin/users",
    "/crop/recommendations",
    "/crop/calendar",
    "/drought/monitor",
    "/drought/alerts",
    "/irrigation/schedule",
    "/irrigation/recommendations",
    "/marketplace/products",
    "/marketplace/orders",
    "/soil/analysis",
}


route_paths = set()
for route in app.router.routes:
    if hasattr(route, "path"):
        route_paths.add(route.path)
    elif hasattr(route, "original_router"):
        route_paths.update(
            child.path for child in route.original_router.routes if hasattr(child, "path")
        )

missing_paths = sorted(EXPECTED_PATHS - route_paths)

assert not missing_paths, f"Missing expected API routes: {missing_paths}"
