class ChangeDefaultForCurrentPageOnBooks < ActiveRecord::Migration[7.0]
  def change
    change_column_default :books, :current_page, 1
  end
end
