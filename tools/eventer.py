import click
import os
import shutil
import requests
import re
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from urllib.parse import urlparse, unquote
import enum
from dataclasses import dataclass, field


class CategoryType(enum.Enum):
    MAID_CAFE = "Maid Cafe"
    BRAND_COLLABORATIONS = "Brand Collaborations" 
    COSPLAYS = "Cosplays"
    EVENT_APPEARANCES = "Event Appearances"
    FASHION = "Fashion"


@dataclass
class Event:
    category: CategoryType
    title: str
    tags: List[str] = field(default_factory=list)
    event_date: Optional[str] = None
    files: List[Path] = field(default_factory=list)
    
    def get_folder_name(self) -> str:
        if self.event_date:
            return f"{self.title}_{self.event_date}"
        return self.title
    
    def get_assets_path(self, base_path: Path = None) -> Path:
        if base_path is None:
            base_path = Path("../portfolio/assets")
        return base_path / self.category.value / self.get_folder_name()
    
    def create_folders(self, copy_files: bool = True) -> bool:
        try:
            assets_path = self.get_assets_path()
            assets_path.mkdir(parents=True, exist_ok=True)
            
            public_path = self.get_assets_path(Path("../portfolio/public/assets"))
            public_path.mkdir(parents=True, exist_ok=True)
            
            if self.files:
                for i, file_path in enumerate(self.files):
                    if file_path.exists():
                        ext = file_path.suffix.lower()
                        if not ext:
                            ext = '.jpg'
                        
                        tag_suffix = ""
                        if self.tags:
                            tag_suffix = " " + " ".join(f"({tag})" for tag in self.tags)
                        
                        new_filename = f"{i}{tag_suffix}{ext}"
                        
                        if copy_files:
                            shutil.copy2(file_path, assets_path / new_filename)
                            shutil.copy2(file_path, public_path / new_filename)
                            print(f"  Copied: {file_path.name} -> {new_filename}")
                        else:
                            shutil.move(str(file_path), str(assets_path / new_filename))
                            shutil.copy2(assets_path / new_filename, public_path / new_filename)
                            print(f"  Moved: {file_path.name} -> {new_filename}")
            
            return True
        except Exception as e:
            print(f"Error creating folders: {e}")
            return False


def _extract_download_urls(html_content: str) -> List[str]:
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        download_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if 'cdn.downloadgram.org' in href and 'download' in link.get_text().lower():
                download_links.append(href)
        
        return download_links
    except ImportError:
        pattern = r'href="(https://cdn\.downloadgram\.org/[^"]*)"[^>]*>[\s]*DOWNLOAD'
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        return matches


def _download_file(url: str, filepath: Path, timeout: int = 30) -> bool:
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        click.echo(f"  Downloading: {filepath.name}")
        response = requests.get(url, headers=headers, timeout=timeout, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        return True
    except Exception as e:
        click.echo(f"  ❌ Failed to download {filepath.name}: {e}", err=True)
        return False


def common_event_options(f):
    f = click.option('--category', '-c', 
                    type=click.Choice([cat.name for cat in CategoryType], case_sensitive=False),
                    required=True,
                    help='Category type for the event')(f)
    f = click.option('--title', '-t', required=True, help='Event title')(f)
    f = click.option('--date', '-d', required=True, help='Event date in MM-DD-YYYY format')(f)
    f = click.option('--tags', help='Comma-separated tags')(f)
    f = click.option('--dry-run', is_flag=True, help='Show what would be created/downloaded without actually doing it')(f)
    return f



@click.group()
def cli():
    pass


@cli.command()
@common_event_options
@click.option('--copy-files', is_flag=True, help='Copy provided files to event folders')
@click.argument('files', nargs=-1, type=click.Path(exists=True, path_type=Path))
def dir(category, title, date, tags, dry_run, copy_files, files):
    category_enum = CategoryType[category.upper()]
    
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else []
    
    if date:
        try:
            datetime.strptime(date, '%m-%d-%Y')
        except ValueError:
            click.echo("Error: Date must be in MM-DD-YYYY format", err=True)
            return
    event = Event(
        category=category_enum,
        title=title,
        event_date=date,
        tags=tag_list,
        files=list(files)
    )
    
    click.echo(f"\nEvent Details:")
    click.echo(f"  Category: {event.category.value}")
    click.echo(f"  Title: {event.title}")
    click.echo(f"  Date: {event.event_date or 'Not specified'}")
    click.echo(f"  Tags: {', '.join(event.tags) if event.tags else 'None'}")
    click.echo(f"  Files: {len(event.files)} files")
    
    click.echo(f"\nFolders to create:")
    click.echo(f"  {event.get_assets_path()}")
    click.echo(f"  {event.get_assets_path(Path('../portfolio/public/assets'))}")
    
    if event.files:
        click.echo(f"\nFiles to copy:")
        for file_path in event.files:
            click.echo(f"  {file_path}")
    
    if dry_run:
        click.echo("\n[DRY RUN] No folders or files were created.")
        return
    
    if not click.confirm(f"\nCreate event folders?"):
        click.echo("Cancelled.")
        return
    
    click.echo("\nCreating event folders...")
    if event.create_folders(copy_files):
        click.echo("✅ Event folders created successfully!")
        click.echo(f"   Assets: {event.get_assets_path().absolute()}")
        click.echo(f"   Public: {event.get_assets_path(Path('../portfolio/public/assets')).absolute()}")
    else:
        click.echo("❌ Failed to create event folders.", err=True)


@cli.command()
def list_categories():
    click.echo("Available categories:")
    for category in CategoryType:
        click.echo(f"  {category.name.lower()}: {category.value}")


@cli.command()
@common_event_options
@click.option('--download-dir', type=click.Path(path_type=Path), 
              help='Directory to download files to (default: current directory)')
@click.argument('html_file', type=click.Path(exists=True, path_type=Path))
def html(category, title, date, tags, dry_run, download_dir, html_file):
    """Download files from an HTML file containing download links."""
    category_enum = CategoryType[category.upper()]
    
    tag_list = [tag.strip() for tag in tags.split(',')] if tags else []
    
    if date:
        try:
            datetime.strptime(date, '%m-%d-%Y')
        except ValueError:
            click.echo("Error: Date must be in MM-DD-YYYY format", err=True)
            return
    if download_dir is None:
        download_dir = Path.cwd()
    download_dir.mkdir(parents=True, exist_ok=True)
    
    # Read and parse HTML file
    try:
        html_content = html_file.read_text(encoding='utf-8')
    except Exception as e:
        click.echo(f"Error reading HTML file: {e}", err=True)
        return
    
    click.echo("Parsing HTML file for download URLs...")
    download_urls = _extract_download_urls(html_content)
    
    if not download_urls:
        click.echo("No download URLs found in HTML file.", err=True)
        return
    
    click.echo(f"Found {len(download_urls)} download URLs")
    
    click.echo(f"\nEvent Details:")
    click.echo(f"  Category: {category_enum.value}")
    click.echo(f"  Title: {title}")
    click.echo(f"  Date: {date or 'Not specified'}")
    click.echo(f"  Tags: {', '.join(tag_list) if tag_list else 'None'}")
    click.echo(f"  Download Directory: {download_dir}")
    click.echo(f"  Files to download: {len(download_urls)}")
    
    if dry_run:
        click.echo("\n[DRY RUN] Files that would be downloaded and renamed:")
        for i, url in enumerate(download_urls):
            if any(ext in url.lower() for ext in ['.jpg', '.jpeg']):
                ext = '.jpg'
            elif any(ext in url.lower() for ext in ['.png']):
                ext = '.png'
            elif any(ext in url.lower() for ext in ['.mp4', '.mov']):
                ext = '.mp4'
            else:
                ext = '.jpg'
                
            tag_suffix = ""
            if tag_list:
                tag_suffix = " " + " ".join(f"({tag})" for tag in tag_list)
            final_name = f"{i}{tag_suffix}{ext}"
            click.echo(f"  {i}: temp_{i}{ext} -> {final_name}")
        click.echo("\n[DRY RUN] No files were downloaded.")
        return
    
    if not click.confirm(f"\nDownload {len(download_urls)} files?"):
        click.echo("Cancelled.")
        return
    click.echo("\nDownloading files...")
    downloaded_files = []
    
    for i, url in enumerate(download_urls):
        if any(ext in url.lower() for ext in ['.jpg', '.jpeg']):
            ext = '.jpg'
        elif any(ext in url.lower() for ext in ['.png']):
            ext = '.png'
        elif any(ext in url.lower() for ext in ['.mp4', '.mov']):
            ext = '.mp4'
        else:
            ext = '.jpg'
        
        temp_filename = f"temp_{i}{ext}"
        filepath = download_dir / temp_filename
        
        if _download_file(url, filepath):
            downloaded_files.append(filepath)
            click.echo(f"  ✅ Downloaded: {temp_filename}")
        else:
            click.echo(f"  ❌ Failed: {temp_filename}")
    
    if not downloaded_files:
        click.echo("No files were successfully downloaded.", err=True)
        return
    
    event = Event(
        category=category_enum,
        title=title,
        event_date=date,
        tags=tag_list,
        files=downloaded_files
    )
    
    click.echo(f"\nCreating event folders...")
    
    if event.create_folders(copy_files=False):
        click.echo(f"✅ Event created successfully!")
        click.echo(f"✅ {len(downloaded_files)} files moved to event folders")
        click.echo(f"   Assets: {event.get_assets_path().absolute()}")
        click.echo(f"   Public: {event.get_assets_path(Path('../portfolio/public/assets')).absolute()}")
    else:
        click.echo("❌ Failed to create event folders.", err=True)


if __name__ == '__main__':
    cli()
