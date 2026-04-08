import "@typespec/http";

using Http;

@service
@server("http://localhost:5000", "Local development server")
@route("api")
@doc("API for appointment booking system - Cal.com clone")
namespace BookingAPI {
  @doc("Represents a type of event that can be booked")
  model EventType {
    @doc("Unique identifier")
    id: string;

    @doc("Display name of the event type")
    name: string;

    @doc("Detailed description of the event type")
    description: string;

    @doc("Duration of the event in minutes")
    @minValue(5)
    durationMinutes: int32;
  }

  @doc("Input model for creating a new event type")
  model CreateEventType {
    @doc("Display name of the event type")
    name: string;

    @doc("Detailed description of the event type")
    description: string;

    @doc("Duration of the event in minutes (default: 30)")
    @minValue(5)
    durationMinutes: int32 = 30;
  }

  @doc("Represents a time slot available for booking")
  model Slot {
    @doc("Unique identifier")
    id: string;

    @doc("ID of the event type this slot belongs to")
    eventTypeId: string;

    @doc("Start time of the slot (UTC)")
    startTime: utcDateTime;

    @doc("End time of the slot (UTC)")
    endTime: utcDateTime;

    @doc("Whether the slot is available for booking")
    isAvailable: boolean;
  }

  @doc("Represents a booking made by a guest")
  model Booking {
    @doc("Unique identifier")
    id: string;

    @doc("ID of the booked event type")
    eventTypeId: string;

    @doc("ID of the booked slot")
    slotId: string;

    @doc("Name of the guest")
    guestName: string;

    @doc("Email of the guest")
    guestEmail: string;

    @doc("When the booking was created (UTC)")
    createdAt: utcDateTime;

    @doc("The booked slot details")
    slot?: Slot;

    @doc("The event type details")
    eventType?: EventType;
  }

  @doc("Input model for creating a new booking")
  model CreateBooking {
    @doc("ID of the event type to book")
    eventTypeId: string;

    @doc("ID of the slot to book")
    slotId: string;

    @doc("Name of the guest")
    guestName: string;

    @doc("Email of the guest")
    guestEmail: string;
  }

  @doc("Error response model with status code")
  model Error {
    @doc("HTTP status code")
    status: int32;
    
    @doc("Error code")
    code: string;
    
    @doc("Error message")
    message: string;
  }

  @doc("List of event types")
  @get
  @route("/event-types")
  op getEventTypes(): EventType[];

  @doc("Get a single event type by ID")
  @route("/event-types/{eventTypeId}")
  @get
  op getEventType(
    @path eventTypeId: string,
  ): EventType | Error;

  @doc("Create a new event type (owner only)")
  @route("/event-types")
  @post
  op createEventType(
    @body eventType: CreateEventType,
  ): EventType | Error;

  @doc("Get available slots for a specific date and event type")
  @route("/slots")
  @get
  op getSlots(
    @query eventTypeId: string,
    @query date: string,
  ): Slot[] | Error;

  @doc("Create a new booking")
  @route("/bookings")
  @post
  op createBooking(
    @body booking: CreateBooking,
  ): Booking | Error;

  @doc("Get all bookings (owner only)")
  @route("/bookings")
  @get
  op getBookings(): Booking[];

  @doc("Delete a booking")
  @route("/bookings/{bookingId}")
  @delete
  op deleteBooking(
    @path bookingId: string,
  ): void | Error;
}
