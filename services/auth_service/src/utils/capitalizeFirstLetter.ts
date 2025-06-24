export function capitalizeFirstLetter(str: string | null | undefined): string {
    if (str == null || str === '') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}