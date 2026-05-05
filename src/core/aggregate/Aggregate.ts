import type { DomainEvent } from "../event/DomainEvent";

export abstract class Aggregate {
    protected version: number = -1;
    private uncommittedEvents: DomainEvent[] = [];

    protected apply(event: DomainEvent): void {
        this.when(event)
        this.uncommittedEvents.push(event)
        this.version++
    }

    rehydrate(events: DomainEvent[]): void {
        for (const event of events) {
            this.when(event)
            this.version = event.version
        }
    }

    protected abstract when(event: DomainEvent): void
    getUncommittedEvents() { return [...this.uncommittedEvents] }
    clearUncommittedEvents() { this.uncommittedEvents = [] }
    getVersion() { return this.version }
}