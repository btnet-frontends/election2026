export interface CategoryInfo {
  name: string;
}

export interface NewsItem {
  article_id: string;
  title: string;
  part_text: string;
  writers: string;
  pubtime: string;
  release_date: string;
  output_link_path: string;
  image_url: string;
  image_url_a: string;
  category_info: CategoryInfo;
}

export interface PageModel {
  currentPage: number;
  lastPage: number;
}

export interface NewsData {
  article_lists: NewsItem[];
  page_model: PageModel;
}
