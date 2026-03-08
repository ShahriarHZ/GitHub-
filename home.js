let allIssues = [];

const loadLessons = () => {
  fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then((res) => res.json())
    .then((json) => {
      allIssues = json.data;
      displayLesson(allIssues);
    })
    .catch(err => console.error("Error fetching data:", err));
};

// --- Search Logic ---
const searchIssues = (searchText) => {
  if (!searchText.trim()) {
    displayLesson(allIssues); // Reset to original data if search is cleared
    return;
  }

  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`)
    .then((res) => res.json())
    .then((json) => {
      displayLesson(json.data); // Render search results
    })
    .catch((err) => console.error("Search error:", err));
};

// Debounce to prevent too many API calls while typing
let searchTimeout = null;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchIssues(e.target.value);
  }, 500); 
});

const showDetails = (id) => {
  const modal = document.getElementById('issue_modal');
  const modalContent = document.getElementById('modal-content');
  
  modal.showModal();
  modalContent.innerHTML = `<div class="flex justify-center py-10"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;

  fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`)
    .then(res => res.json())
    .then(json => {
      const issue = json.data;
      const priorityColor = 
        issue.priority?.toLowerCase() === "high" ? "bg-red-500" : 
        issue.priority?.toLowerCase() === "medium" ? "bg-yellow-500" : "bg-green-500";

      modalContent.innerHTML = `
        <h2 class="text-2xl font-bold text-slate-800 mb-2">${issue.title}</h2>
        <div class="flex items-center gap-3 text-xs text-gray-500 mb-6">
          <span class="badge badge-success text-white py-3 px-4 rounded-full font-bold">Opened</span>
          <span>Opened by <span class="font-semibold text-gray-700">${issue.author}</span> • ${issue.date}</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-6">
          ${issue.labels.map(label => `<span class="badge badge-outline border-pink-300 text-pink-500 font-bold uppercase text-[10px]">${label}</span>`).join('')}
        </div>
        <p class="text-slate-600 leading-relaxed mb-8">${issue.description}</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Assignee:</p>
            <p class="font-bold text-slate-800">${issue.author}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-[10px] uppercase font-bold text-gray-400 mb-1">Priority:</p>
            <span class="${priorityColor} text-white text-[10px] font-bold px-3 py-1 rounded inline-block uppercase">${issue.priority}</span>
          </div>
        </div>
      `;
    });
};

const filterIssues = (status) => {
  const btnAll = document.getElementById('btn-all');
  const btnOpen = document.getElementById('btn-open');
  const btnClosed = document.getElementById('btn-closed');
  const radioOpen = document.getElementById('radio-open');
  const radioClosed = document.getElementById('radio-closed');

  [btnAll, btnOpen, btnClosed].forEach(btn => btn?.classList.remove('btn-primary'));

  if (status === 'all') btnAll.classList.add('btn-primary');
  if (status === 'open') {
    btnOpen.classList.add('btn-primary');
    if (radioOpen) radioOpen.checked = true;
  }
  if (status === 'closed') {
    btnClosed.classList.add('btn-primary');
    if (radioClosed) radioClosed.checked = true;
  }

  if (status === 'all') {
    displayLesson(allIssues);
  } else {
    const filtered = allIssues.filter(issue => issue.status.toLowerCase() === status.toLowerCase());
    displayLesson(filtered);
  }
};

const displayLesson = (issues) => {
  const container = document.getElementById("issue-container");
  const numberElement = document.getElementById("IssueNumber");
  
  if (numberElement) numberElement.innerText = `${issues.length} Issues`;

  container.innerHTML = ""; 

  if (issues.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-20 text-gray-400">No issues found.</div>`;
    return;
  }

  issues.forEach((issue) => {
    const priority = issue.priority?.toLowerCase() || "";
    let borderClass = priority === "high" ? "border-t-red-500" : priority === "medium" ? "border-t-yellow-500" : "border-t-green-500";
    let badgeClass = priority === "high" ? "bg-red-50 text-red-600 border-red-100" : priority === "medium" ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-green-50 text-green-600 border-green-100";

    const card = document.createElement("div");
    card.className = `card bg-white shadow-sm border-t-4 ${borderClass} p-6 flex flex-col gap-3 h-full cursor-pointer transition-all hover:scale-[1.01]`;
    card.onclick = () => showDetails(issue._id || issue.id);

    card.innerHTML = `
      <div class="flex justify-end">
        <span class="text-[10px] font-bold uppercase px-2 py-1 rounded border ${badgeClass}">${issue.priority}</span>
      </div>
      <h3 class="font-bold text-lg text-slate-800">${issue.title}</h3>
      <p class="text-sm text-slate-500 flex-grow line-clamp-3">${issue.description}</p>
      <div class="flex flex-wrap gap-2 mb-2">
        ${issue.labels.map(label => `<span class="badge badge-outline border-pink-200 text-pink-500 text-[10px] font-bold uppercase">${label}</span>`).join('')}
      </div>
      <div class="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
        <p>By <span class="font-medium text-slate-700">${issue.author}</span></p>
        <p>${issue.date}</p>
      </div>
    `;
    container.appendChild(card);
  });
};

loadLessons();