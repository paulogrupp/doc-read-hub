import { Controller } from "@hotwired/stimulus"
import 'pdfjs-dist'

// Connects to data-controller="pdf-reader"
export default class extends Controller {
  static targets = ["canvas", "pageNumber"]
  static values = { url: String }

  currentPage = 1
  pdf = null
  scale = 1.75

  connect() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js'
    this.loadPdf()
  }

  async loadPdf() {
    const loadingTask = pdfjsLib.getDocument(this.urlValue)
    this.pdf = await loadingTask.promise
    this.pageNumberTarget.value = this.currentPage
    this.renderPage()
  }

  async renderPage() {
    const page = await this.pdf.getPage(this.currentPage)
    const viewport = page.getViewport({ scale: this.scale });
    const canvas = this.canvasTarget
    canvas.width = viewport.width
    canvas.height = viewport.height

    const context = canvas.getContext("2d")
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    await page.render(renderContext)
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

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1
      this.renderPage()
      this.pageNumberTarget.value = this.currentPage
    }
  }

  nextPage() {
    if (this.currentPage < this.pdf.numPages) {
      this.currentPage += 1
      this.renderPage()
      this.pageNumberTarget.value = this.currentPage
    }
  }

  changePage() {
    let requestedPage = Number(this.pageNumberTarget.value)
    if (requestedPage > 0 && requestedPage <= this.pdf.numPages) {
      this.currentPage = requestedPage
      this.renderPage()
    } else {
      alert(`Invalid page number (Max: ${this.pdf.numPages})`)
      this.pageNumberTarget.value = this.currentPage
    }
  }
}
