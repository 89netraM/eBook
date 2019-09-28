import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { PartComponent } from "./part/part.component";
import { BookComponent } from "./book/book.component";

@NgModule({
	declarations: [
		AppComponent,
		PartComponent,
		BookComponent
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
