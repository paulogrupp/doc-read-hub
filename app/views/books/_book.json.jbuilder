json.extract! book, :id, :title, :author, :description, :current_page, :file_bucket_key, :created_at, :updated_at
json.url book_url(book, format: :json)
