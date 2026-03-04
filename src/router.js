// ===== SPA Router =====

const routes = {};
let currentRoute = '';

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getParams() {
    const hash = window.location.hash.slice(1);
    const [path, query] = hash.split('?');
    const params = {};
    if (query) {
        query.split('&').forEach(pair => {
            const [key, val] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(val || '');
        });
    }
    return { path, params };
}

export function initRouter() {
    function handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path] = hash.split('?');
        currentRoute = path;

        const main = document.getElementById('main-content');
        if (!main) return;

        const handler = routes[path];
        if (handler) {
            handler(main);
        } else {
            // Try to match parametric routes like /worker/:id
            for (const [routePath, routeHandler] of Object.entries(routes)) {
                if (routePath.includes(':')) {
                    const routeParts = routePath.split('/');
                    const pathParts = path.split('/');
                    if (routeParts.length === pathParts.length) {
                        const params = {};
                        let match = true;
                        for (let i = 0; i < routeParts.length; i++) {
                            if (routeParts[i].startsWith(':')) {
                                params[routeParts[i].slice(1)] = pathParts[i];
                            } else if (routeParts[i] !== pathParts[i]) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            routeHandler(main, params);
                            window.scrollTo(0, 0);
                            return;
                        }
                    }
                }
            }

            // 404
            main.innerHTML = `
        <div class="container section text-center">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>Sahifa topilmadi</h3>
            <p class="text-muted">Kechirasiz, bu sahifa mavjud emas.</p>
            <a href="#/" class="btn btn-primary mt-4">Bosh sahifaga</a>
          </div>
        </div>
      `;
        }
        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

export function getCurrentRoute() {
    return currentRoute;
}
