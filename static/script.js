let currentPrompt = "";
let currentImages = [];



async function generateMoodboard() {
  const prompt = document.getElementById("promptInput").value;
  currentPrompt = prompt;
  const moodboard = document.getElementById("moodboard");
  moodboard.innerHTML = "Loading...";

  
  const response = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  moodboard.innerHTML = "";

  if (!data.images || data.images.length === 0) {
    const noImage = document.createElement("p");
    noImage.textContent = "No images found. Try another prompt.";
    noImage.className = "text-red-500 text-lg";
    moodboard.appendChild(noImage);
    return;
  }

  // Display images in 2-column layout
  data.images.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "mb-4 w-full rounded-xl shadow-lg break-inside-avoid cursor-pointer hover:opacity-90 transition";
    img.onclick = () => openModal(url);  // Add click handler
    moodboard.appendChild(img);
  });
  currentPrompt = prompt;
  currentImages = data.images;

}

function openModal(url) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const downloadLink = document.getElementById("downloadLink");

  // Set image and show modal
  modalImg.src = url;
  downloadLink.setAttribute("data-url", url);
  modal.classList.remove("hidden");

  // Hide main UI and apply background blur
  document.getElementById("mainUI").classList.add("hidden");
  document.body.classList.add("backdrop-blur-md");
}


function closeModal() {
  document.getElementById("imageModal").classList.add("hidden");
  document.getElementById("mainUI").classList.remove("hidden");
  document.body.classList.remove("backdrop-blur-md");
}



document.getElementById("downloadLink").addEventListener("click", async function (e) {
  e.preventDefault();
  const url = this.getAttribute("data-url");

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const tempLink = document.createElement("a");
    tempLink.href = blobUrl;

    // Format prompt into filename
    const safePrompt = currentPrompt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    tempLink.download = `${safePrompt || "moodboard-image"}.jpg`;

    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert("Download failed.");
    console.error(err);
  }
});


function saveCurrentBoard() {
  if (!currentPrompt || currentImages.length === 0) {
    alert("Nothing to save yet!");
    return;
  }

  const saved = JSON.parse(localStorage.getItem("moodboards") || "[]");

  // Save new board
  saved.push({
    prompt: currentPrompt,
    images: currentImages
  });

  localStorage.setItem("moodboards", JSON.stringify(saved));
  alert("Board saved!");
  loadSavedBoards(); // Refresh saved list
}

function loadSavedBoards() {
  const savedList = document.getElementById("savedBoards");
  savedList.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("moodboards") || "[]");

  if (saved.length === 0) {
    savedList.innerHTML = "<li class='text-gray-400'>No boards yet</li>";
    return;
  }

  saved.forEach((board, index) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center p-2 rounded hover:bg-gray-100 cursor-pointer";

    const label = document.createElement("span");
    label.textContent = board.prompt;
    label.className = "flex-grow";
    label.onclick = () => {
        currentPrompt = board.prompt;
        currentImages = board.images;
        renderMoodboard(board.images);

        // Hide dropdown immediately
        document.getElementById("savedBoardsWrapper").classList.add("hidden");
    };


    const delBtn = document.createElement("button");
    delBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke-width="2" stroke="currentColor" class="w-4 h-4 text-red-500 hover:text-red-700">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>`;
    delBtn.className = "ml-2";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteSavedBoard(index);
    };

    li.appendChild(label);
    li.appendChild(delBtn);
    savedList.appendChild(li);
  });
}


function deleteSavedBoard(index) {
  const saved = JSON.parse(localStorage.getItem("moodboards") || "[]");
  saved.splice(index, 1); // remove selected board
  localStorage.setItem("moodboards", JSON.stringify(saved));
  loadSavedBoards(); // refresh UI
}


function renderMoodboard(images) {
  const moodboard = document.getElementById("moodboard");
  moodboard.innerHTML = "";

  images.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "mb-4 w-full rounded-xl shadow-lg break-inside-avoid cursor-pointer hover:scale-105 transition transform bg-white p-1 border rotate-[1deg]";

    img.onclick = () => openModal(url);
    moodboard.appendChild(img);
  });
}





window.addEventListener("DOMContentLoaded", loadSavedBoards);

let hoverTimeout;

const toggle = document.getElementById("savedBoardsToggle");
const wrapper = document.getElementById("savedBoardsWrapper");
const container = document.getElementById("savedBoardsContainer");

// Show dropdown on hover
container.addEventListener("mouseenter", () => {
  clearTimeout(hoverTimeout);
  wrapper.classList.remove("hidden");
});

// Hide dropdown after delay on mouse leave
container.addEventListener("mouseleave", () => {
  hoverTimeout = setTimeout(() => {
    wrapper.classList.add("hidden");
  }, 250); // adjust delay here (ms)
});
