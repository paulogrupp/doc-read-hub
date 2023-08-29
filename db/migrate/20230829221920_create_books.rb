class CreateBooks < ActiveRecord::Migration[7.0]
  def change
    create_table :books do |t|
      t.string :title
      t.string :author
      t.text :description
      t.integer :current_page
      t.string :file_bucket_key

      t.timestamps
    end
  end
end
