// This module handles connectivity to Supabase using your public ANON_KEY
import supabase from "../lib/supabaseBrowserClient.js";

const gallery = document.getElementById("image-gallery");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const statusMessage = document.getElementById("status-message");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightboxBtn = document.getElementById("close-lightbox");

const BUCKET_NAME = "images";

// --- Fetch and Display Images ---
async function fetchImages() {
  gallery.innerHTML = "<p>Loading images...</p>";
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    gallery.innerHTML = `<p class="error">Error fetching images: ${error.message}</p>`;
    console.error("Error fetching images:", error);
    return;
  }

  if (data.length === 0) {
    gallery.innerHTML = "<p>No images in the gallery yet. Upload one!</p>";
    return;
  }

  gallery.innerHTML = ""; // Clear loading message
  for (const file of data) {
    if (file.name === '.emptyFolderPlaceholder') continue; // Supabase adds this, ignore it
    
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(file.name);
    
    const card = document.createElement("div");
    card.className = "image-card";
    card.innerHTML = `
      <img src="${publicUrl}" alt="${file.name}">
      <div class="card-overlay">
        <p>${file.name}</p>
        <a href="${publicUrl}" download="${file.name}" class="download-btn">Download</a>
      </div>
    `;
    gallery.appendChild(card);
  }
}

// --- Handle File Upload ---
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    statusMessage.textContent = "Please select a file to upload.";
    statusMessage.className = "error";
    return;
  }

  statusMessage.textContent = `Uploading ${file.name}...`;
  statusMessage.className = "info";

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(file.name, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite existing file with the same name
    });

  if (error) {
    statusMessage.textContent = `Upload failed: ${error.message}`;
    statusMessage.className = "error";
    console.error("Upload error:", error);
  } else {
    statusMessage.textContent = "Upload successful!";
    statusMessage.className = "success";
    uploadForm.reset();
    await fetchImages(); // Refresh the gallery
  }
});

// --- Lightbox Logic ---
gallery.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    lightboxImage.src = e.target.src;
    lightbox.classList.remove("hidden");
  }
});

function closeLightbox() {
  lightbox.classList.add("hidden");
}

closeLightboxBtn.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target.id === "lightbox") {
    closeLightbox();
  }
});

// --- Initial Load ---
fetchImages();