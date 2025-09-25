interface LayoutProps {
    seatData: unknown;
    selectedSeats: unknown;
    onSeatSelect: unknown;

}

export function GreenOceanPremiumLayout({ seatData, selectedSeats, onSeatSelect}: LayoutProps) {
    return (
        <div>
            <h1>GreenOcean Premium Layout</h1>
        </div>
    )
}