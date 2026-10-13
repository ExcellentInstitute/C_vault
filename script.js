document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Fetch raw data from the hidden script tag
    const rawData = document.getElementById('vault-database').textContent;
    
    // 2. The Foolproof Parser
    const programs = [];
    const blocks = rawData.split('[PROGRAM]');
    
    blocks.forEach(block => {
        if (block.trim() === '') return;
        
        // Extract Title, Category, and everything after "Code:"
        const titleMatch = block.match(/Title:\s*(.+)/i);
        const catMatch = block.match(/Category:\s*(.+)/i);
        const codeMatch = block.match(/Code:\s*([\s\S]+)/i); 
        
        if (titleMatch && codeMatch) {
            programs.push({
                id: Math.random().toString(36).substr(2, 9),
                title: titleMatch[1].trim(),
                category: catMatch ? catMatch[1].trim() : 'General',
                code: codeMatch[1].trim()
            });
        }
    });

    // 3. UI Elements
    const grid = document.getElementById('programGrid');
    const categoryContainer = document.getElementById('categoryContainer');
    const searchInput = document.getElementById('searchInput');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');

    let currentCategory = 'All';
    let searchQuery = '';

    // 4. Generate Categories dynamically based on your text entries
    const categories = ['All', ...new Set(programs.map(p => p.category))];
    
    function renderCategories() {
        categoryContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            const isActive = cat === currentCategory;
            
            btn.className = isActive 
                ? 'px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-md transition-all whitespace-nowrap'
                : 'px-4 py-1.5 rounded-full text-xs font-bold bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all whitespace-nowrap border border-slate-600';
            
            btn.innerText = cat;
            btn.onclick = () => {
                currentCategory = cat;
                renderCategories();
                renderGrid();
            };
            categoryContainer.appendChild(btn);
        });
    }

    // 5. Render Program Cards
    function renderGrid() {
        grid.innerHTML = '';
        
        const filtered = programs.filter(p => {
            const matchesCat = currentCategory === 'All' || p.category === currentCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery) || p.code.toLowerCase().includes(searchQuery);
            return matchesCat && matchesSearch;
        });

        resultsCount.innerText = `${filtered.length} Program${filtered.length !== 1 ? 's' : ''} Available`;

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            
            filtered.forEach(p => {
                const card = document.createElement('div');
                card.className = 'program-card bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-full';
                
                // Escape code for HTML display
                const safeCode = p.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");

                card.innerHTML = `
                    <div class="p-5 border-b border-slate-700/50 flex justify-between items-start gap-2">
                        <div>
                            <h3 class="font-bold text-slate-100 text-base leading-tight">${p.title}</h3>
                            <span class="inline-block mt-2 px-2 py-0.5 bg-slate-900 text-indigo-400 border border-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                ${p.category}
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-4 flex-1 bg-slate-800/50">
                        <div class="code-preview custom-scrollbar">${safeCode}</div>
                    </div>
                    
                    <div class="p-4 border-t border-slate-700/50 bg-slate-900/50 mt-auto">
                        <button onclick="sendToApp('${p.id}')" class="btn-load w-full py-3 bg-slate-700 text-slate-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                            <i class="fa-solid fa-cloud-arrow-down"></i> Load to Workspace
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    }

    // 6. Connect the Search Bar
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderGrid();
    });

    // 7. Communication Bridge to Android App!
    window.sendToApp = function(id) {
        const program = programs.find(p => p.id === id);
        if (!program) return;

        // Check if the webpage is running inside our Android App's Webview
        if (window.AndroidIDE && window.AndroidIDE.loadCode) {
            window.AndroidIDE.loadCode(program.code);
        } else {
            // Fallback: If opened in a normal Chrome desktop browser, just copy to clipboard
            navigator.clipboard.writeText(program.code).then(() => {
                alert(`"${program.title}" copied to clipboard! (Open inside the C Compiler IDE app to load automatically).`);
            });
        }
    };

    // Initialize
    renderCategories();
    renderGrid();
});
