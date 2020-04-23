import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { PartComponent } from "./part/part.component";
import { BookComponent } from "./book/book.component";
import { ControlsComponent } from "./controls/controls.component";
import { TOCComponent } from "./controls/toc/toc.component";

@NgModule({
	declarations: [
		AppComponent,
		PartComponent,
		BookComponent,
		ControlsComponent,
		TOCComponent
	],
	imports: [
		BrowserModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
