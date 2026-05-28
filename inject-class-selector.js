const fs = require('fs');

function inject(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already injected
  if (content.includes('!selectedClass ? (')) {
    console.log(`Already injected ${file}`);
    return;
  }

  // Find `<div className="page-content">` and replace it
  const match = content.match(/<div className="page-content">/);
  if (match) {
    content = content.replace(
      '<div className="page-content">',
      `{!selectedClass ? (
          <ClassSelector 
            onSelectClass={(cls) => setSelectedClass(cls)} 
            onCancel={() => {
              if (typeof onNavigate !== "undefined" && onNavigate) onNavigate("guruDashboard");
            }} 
          />
        ) : (
        <div className="page-content">`
    );

    // Now we need to add the closing `)}` before the closing tags of `<main>`.
    // It looks like `</main>` is near the end. Let's find `</main>` and put `)}` before it.
    // Wait, the page-content div closes before `</main>`. 
    // Usually it's `</div>\n      </main>`
    content = content.replace(
      /<\/div>\s*<\/main>/,
      `</div>\n        )}\n      </main>`
    );

    fs.writeFileSync(file, content);
    console.log(`Injected ${file}`);
  } else {
    console.log(`Failed to find page-content in ${file}`);
  }
}

inject('frontend/src/pages/guru/guruMateri/guruMateri.jsx');
inject('frontend/src/pages/guru/guruTugas/guruTugas.jsx');
inject('frontend/src/pages/guru/guruPresensi/guruPresensi.jsx');
