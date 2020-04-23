import { Component, Input, HostBinding, Output, EventEmitter } from "@angular/core";

@Component({
	selector: "app-controls",
	templateUrl: "./controls.component.html",
	styleUrls: [
		"./controls.component.scss",
		"./range.controls.component.scss"
	]
})
export class ControlsComponent {
	private _percentage: number = 0;
	@Input()
	public get percentage(): number {
		return this._percentage;
	}
	public set percentage(value: number) {
		const newValue = Math.max(0, Math.min(value, 100));
		if (this._percentage !== newValue) {
			this._percentage = newValue;
		}
	}
	@Output()
	public percentageChange = new EventEmitter();

	public get prettyPercentage(): number {
		return Math.round(this.percentage);
	}

	@Input()
	@HostBinding("class.visible")
	public visible: boolean = true;

	public tocVisible = false;
	public get styleTOCVisible(): string {
		return this.tocVisible ? "visible" : "collapse";
	}

	public constructor() { }

	public onPercentageChange(e: number) {
		const percentageBefore = this.percentage;
		this.percentage = e;

		if (this.percentage !== percentageBefore) {
			this.percentageChange.emit(this.percentage);
		}
	}
}