"""Create the static Vercel package from the same files served on localhost."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

root = Path(__file__).resolve().parents[1]
output = root / '.vercel' / 'output'
static = output / 'static'
# This is generated output only; application source files are never removed.
if static.exists():
    shutil.rmtree(static)
static.mkdir(parents=True)
for source in root.glob('*.html'):
    shutil.copy2(source, static / source.name)
for directory in ('css', 'fonts', 'img', 'js', 'vendor'):
    shutil.copytree(root / directory, static / directory, ignore=shutil.ignore_patterns('*.md'))
(static / 'design').mkdir()
poster = 'crane-storyboard-v5-twelve-frames.png'
shutil.copy2(root / 'design' / poster, static / 'design' / poster)
files = {}
for source in sorted(static.rglob('*')):
    if source.is_file():
        files[str(source.relative_to(static))] = hashlib.sha256(source.read_bytes()).hexdigest()
revision = hashlib.sha256(json.dumps(files, sort_keys=True).encode()).hexdigest()[:12]
(static / 'build.json').write_text(json.dumps({
    'revision': revision,
    'generatedAt': datetime.now(timezone.utc).isoformat(),
    'hero': 'threejs-immersive-site-v13',
    'design': 'grand-industrial-v7',
    'files': {name: value for name, value in files.items() if name in (
        'index.html', 'css/site.css', 'css/design.css', 'css/construction-story.css', 'js/ui.js', 'js/tw-config.js', 'js/crane-hero.js', 'js/crane-scene.js', 'js/crane-details.js',
        'js/crane-rig.js', 'js/crane-surfaces.js', 'js/crane-architecture.js', 'js/crane-activity.js', 'js/crane-renderer.js', 'js/crane-effects.js')},
}, indent=2) + '\n')
(output / 'config.json').write_text(json.dumps({'version': 3}, indent=2) + '\n')
print(f'Prepared {len(files)} files. Revision: {revision}')
