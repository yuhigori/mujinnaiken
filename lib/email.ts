export function sendReservationConfirmation(email: string, reservation: any) {
    console.log('===== 予約完了メール =====');
    console.log(`宛先: ${email}`);
    console.log(`予約ID: ${reservation.id}`);
    console.log(`物件: ${reservation.property?.name || 'N/A'}`);
    console.log(`内見日時: ${new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}`);
    console.log(`アクセストークン: ${reservation.token}`);
    console.log('========================');
}

export function sendKeyCodeIssued(email: string, reservation: any, keyCode: string) {
    console.log('===== キーコード発行通知 =====');
    console.log(`宛先: ${email}`);
    console.log(`予約ID: ${reservation.id}`);
    console.log(`キーコード: ${keyCode}`);
    console.log(`内見日時: ${new Date(reservation.slot?.start_time).toLocaleString('ja-JP')}`);
    console.log('============================');
}

export function sendKeyReturnReminder(email: string, reservation: any) {
    console.log('===== 鍵返却リマインド =====');
    console.log(`宛先: ${email}`);
    console.log(`予約ID: ${reservation.id}`);
    console.log(`物件: ${reservation.property?.name || 'N/A'}`);
    console.log('===========================');
}
