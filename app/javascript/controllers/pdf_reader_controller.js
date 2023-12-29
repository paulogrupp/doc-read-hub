import { Controller } from "@hotwired/stimulus";
import 'pdfjs-dist';

export default class extends Controller {
  static targets = ["canvas", "pageNumber"];
  static values = { url: String };

  currentPage = Number(this.data.get("currentPage"));
  bookId = this.data.get("bookId");
  pdf = null;
  scale = 1.75;

  connect() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js';
    this.loadPdf();

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  disconnect() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowRight':
        this.nextPage();
        break;
      case 'ArrowLeft':
        this.prevPage();
        break;
      case 'ArrowUp':
        this.zoomIn();
        break;
      case 'ArrowDown':
        this.zoomOut();
        break;
      default:
        break;
    }
  }

  async loadPdf() {
    const loadingTask = pdfjsLib.getDocument(this.urlValue);
    this.pdf = await loadingTask.promise;
    this.pageNumberTarget.value = this.currentPage;
    this.renderPage();
  }

  async renderPage() {
    const page = await this.pdf.getPage(this.currentPage);
    const viewport = page.getViewport({ scale: this.scale });
    const canvas = this.canvasTarget;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext);
  }

  zoomIn() {
    this.scale += 0.25;
    this.renderPage();
  }

  zoomOut() {
    if (this.scale > 0.25) {
      this.scale -= 0.25;
      this.renderPage();
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.renderPage();
      this.pageNumberTarget.value = this.currentPage;

      await this.updateCurrentPageAttribute();
    }
  }

  async nextPage() {
    if (this.currentPage < this.pdf.numPages) {
      this.currentPage += 1;
      this.renderPage();
      this.pageNumberTarget.value = this.currentPage;

      await this.updateCurrentPageAttribute();
    }
  }

  async updateCurrentPageAttribute() {
    try {
      const response = await fetch(`/books/${this.bookId}/update_current_page`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({ current_page: this.currentPage }),
      });

      if (!response.ok) {
        console.error('Failed to update current_page attribute');
      }
    } catch (error) {
      console.error('An error occurred while updating current_page attribute:', error);
    }
  }

  async changePage() {
    let requestedPage = Number(this.pageNumberTarget.value);
    if (requestedPage > 0 && requestedPage <= this.pdf.numPages) {
      this.currentPage = requestedPage;
      this.renderPage();
      await this.updateCurrentPageAttribute();
    } else {
      alert(`Invalid page number (Max: ${this.pdf.numPages})`);
      this.pageNumberTarget.value = this.currentPage;
    }
  }
}
