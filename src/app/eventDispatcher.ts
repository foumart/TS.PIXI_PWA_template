export class EventDispatcher {
	static dispatchEvent(name: string, data: unknown = null, ...args: Array<unknown>): void {
		const event = new CustomEvent(name, { detail: args.length ? [data, ...args] : data });
		window.parent.document.dispatchEvent(event);
	}
}
