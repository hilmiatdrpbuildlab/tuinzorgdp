/** A small static server for the build output (.svelte-kit/cloudflare), used by the screenshot and responsive scripts. */
import { createServer, type Server } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.woff2': 'font/woff2',
	'.json': 'application/json',
	'.xml': 'application/xml',
	'.txt': 'text/plain'
};

export function serveStatic(root: string, port: number): Promise<Server> {
	const server = createServer((req, res) => {
		const url = new URL(req.url ?? '/', 'http://x');
		let p = decodeURIComponent(url.pathname);
		const candidates = [p, `${p}.html`, path.posix.join(p, 'index.html')];
		if (p === '/') candidates.unshift('/index.html');
		for (const c of candidates) {
			const file = path.join(root, c);
			if (existsSync(file) && statSync(file).isFile()) {
				res.writeHead(200, {
					'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream'
				});
				res.end(readFileSync(file));
				return;
			}
		}
		p = path.join(root, '404.html');
		res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
		res.end(existsSync(p) ? readFileSync(p) : 'Not Found');
	});
	return new Promise((resolve) => server.listen(port, () => resolve(server)));
}
