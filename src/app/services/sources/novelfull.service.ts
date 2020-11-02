import { Injectable } from '@angular/core';
import { chapterObj, novelObj } from "app/resources/types";
import { DatabaseService } from "../database.service";
import { NovelFactoryService } from "../novel-factory.service";
import { sourceService } from "./sourceService";

@Injectable({
	providedIn: 'root'
})
export class NovelfullService extends sourceService {

	constructor(public database: DatabaseService, public novelFactory: NovelFactoryService) {
		super(database);
	}

	async searchWIthLink(link: string, source: string, updatingInfo: boolean): Promise<novelObj> {
		this.error = false;
		this.searching = true;

		let novel: novelObj = {};		// Declare novel object

		// Check if the novel exists in the database
		novel = this.database.getNovel(link)
		if (novel && !updatingInfo) {
			this.sourceNovels.unshift(novel);
			return novel;
		} else {
			novel = {};
		}

		try {
			const html = await this.getHtml(link);		// Get HTML from the link

			// Link
			if (!updatingInfo) novel.link = link;

			// Source
			if (!updatingInfo) novel.source = source;

			// InLibrary
			if (!updatingInfo) novel.inLibrary = false;	// Set as false to distinguish between novels already present

			//////////////////////// YOUR CODE STARTS HERE ///////////////////////////////

			// FIXME: Name
			novel.name = html.getElementsByClassName('title')[0].textContent;

			// FIXME: LatestChapter
			novel.latestChapter = html.getElementsByClassName('l-chapter')[0].getElementsByTagName('a')[0].title;

			// FIXME: Cover
			novel.cover = html.getElementsByClassName('book')[0].getElementsByTagName('img')[0].src.replace('localhost:4200', 'novelfull.com');

			// FIXME: TotalChapters
			novel.totalChapters = 0;

			// FIXME: Author(s)
			novel.author = html.getElementsByClassName('info')[0].getElementsByTagName('a')[0].text;

			// FIXME: Genre(s)
			const genres = html.getElementsByClassName('info')[0].getElementsByTagName('div')[1].getElementsByTagName('a');
			let genre = "";
			for (let i = 0; i < genres.length; i++) {
				genre += genres[i].innerText + ", ";
			}
			novel.genre = genre.slice(0, -2);

			// FIXME: Summary
			const summaryList = html.getElementsByClassName('desc-text')[0].getElementsByTagName('p');
			try {
				let summary = ""
				for (let i = 0; i < summaryList.length; i++) {
					summary += summaryList[i].innerText.trim() + "\n";
				}
				novel.summary = summary;
			} catch (error) {
				novel.summary = "N/A";
				console.log(error);
			}
			console.log(novel.summary);

			//////////////////////// YOUR CODE ENDS HERE /////////////////////////////////

			this.pushOrUpdateNovel(novel, updatingInfo);
		} catch (error) {
			console.error(error);
			this.errorMessage = "ERROR FETCHING NOVEL";
			this.error = true;
		}

		this.searching = false;
		return novel;
	}

	async searchWithName(name: string, source: string): Promise<void> {
		this.error = false;
		this.searching = true;

		//////////////////////// [1] YOUR CODE STARTS HERE ///////////////////////////////

		// FIXME: Generate the search link from novel name
		name = encodeURI(name.replace(/ /g, '+'));	// Replace spaces in novel name to a + for creating the search link
		const searchLink = "https://novelfull.com/search?keyword=" + name;	// Search link that will find the novels of this name

		//////////////////////// YOUR CODE ENDS HERE /////////////////////////////////

		const foundNovels: novelObj[] = [];	// Will store the novels found from this name

		try {
			const html = await this.getHtml(searchLink);
			let novel: novelObj;
			//////////////////////// [2] YOUR CODE STARTS HERE ///////////////////////////////

			// FIXME: Get the list of all search result elements
			const novelList = html.getElementsByClassName('list-truyen')[0].getElementsByClassName('row');

			//////////////////////// YOUR CODE ENDS HERE /////////////////////////////////

			for (let i = 0; i < novelList.length; i++) {
				novel = {};

				// Source
				novel.source = source;

				//////////////////////// [3] YOUR CODE STARTS HERE ///////////////////////////////
				console.log(novelList[i])
				// FIXME: Link
				novel.link = novelList[i].getElementsByClassName('truyen-title')[0].getElementsByTagName('a')[0].href;

				// FIXME: Name
				novel.name = novelList[i].getElementsByClassName('truyen-title')[0].getElementsByTagName('a')[0].innerText;

				// FIXME: LatestChapter
				novel.latestChapter = novelList[i].getElementsByClassName('chapter-text')[0].textContent;

				// FIXME: Cover
				novel.cover = novelList[i].getElementsByTagName('img')[0].src.replace('localhost:4200', 'novelfull.com');
				console.log(novel.cover);

				// FIXME: TotalChapters
				novel.totalChapters = 0;	// If totalChapters is unknown, set it to 0 as it will not accept a string

				// FIXME: Author(s)
				novel.author = novelList[i].getElementsByClassName("author")[0].textContent;

				// FIXME: Genre(s)
				novel.genre = "unknown";

				// FIXME: Summary
				novel.summary = "unknown";

				//////////////////////// YOUR CODE ENDS HERE /////////////////////////////////

				// Check if novel is already in the searched novel list and remove it
				this.sourceNovels = this.sourceNovels.filter(sourceNovel => sourceNovel.link !== novel.link);

				// Check if the novel exists in the database
				const libNovel = this.database.getNovel(novel.link);
				if (libNovel) {
					foundNovels.push(libNovel);
					continue;
				} else {
					foundNovels.push(novel);
				}

				// Source
				novel.source = source;
			}
		} catch (error) {
			console.error(error)
			this.errorMessage = "ERROR SEARCHING FOR NOVEL";
			this.error = true;
		}

		this.searching = false;
		this.sourceNovels = [...foundNovels, ...this.sourceNovels];
	}

	async download(novel: novelObj, downloadID: number): Promise<void> {

	}
}
