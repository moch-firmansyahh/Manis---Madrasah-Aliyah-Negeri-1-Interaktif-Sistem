const fs = require('fs');

function fixClosing(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Check if it already has `)}` before `</main>`
  if (content.includes(')}\n      </main>')) {
    console.log(file, 'already has )}');
    return;
  }

  // Find `</div>\n      </main>` or similar and insert `)}`
  const newContent = content.replace(
    /<\/div>\s*<\/main>\s*<\/div>\s*\);\s*\}/,
    '</div>\n        )}\n      </main>\n    </div>\n  );\n}'
  );

  fs.writeFileSync(file, newContent);
}

fixClosing('frontend/src/pages/guru/guruMateri/guruMateri.jsx');
fixClosing('frontend/src/pages/guru/guruTugas/guruTugas.jsx');
fixClosing('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx');
