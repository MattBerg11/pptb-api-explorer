import { defineConfig, type Plugin } from "vite";

/**
 * PPTB loads dist/index.html without a module loader, so (as in generator-pptb):
 * - drop type="module" and crossorigin from script tags (the bundle is IIFE)
 * - move scripts to the end of <body> so the DOM exists when the IIFE runs
 */
function fixHtmlForPPTB(): Plugin {
    return {
        name: "fix-html-for-pptb",
        enforce: "post",
        transformIndexHtml(html) {
            html = html.replace(/\s*type="module"/g, "").replace(/\s*crossorigin/g, "");
            const scripts: string[] = [];
            html = html.replace(/(<script[^>]*src="[^"]*"[^>]*><\/script>)/g, (match) => {
                scripts.push(match);
                return "";
            });
            return scripts.length ? html.replace("</body>", `    ${scripts.join("\n    ")}\n    </body>`) : html;
        },
    };
}

export default defineConfig((configEnv) => ({
    plugins: [fixHtmlForPPTB()],
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        cssCodeSplit: false,
        sourcemap: configEnv.mode === "development",
        rollupOptions: {
            output: {
                format: "iife",
                inlineDynamicImports: true,
            },
        },
    },
}));
