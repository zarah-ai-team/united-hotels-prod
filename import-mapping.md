# Import Mapping

Source workbook: HOTEL-INFORMATIONS-ENGLISH-2026.xlsx

## General Informations

| Excel Column | Target Table | Target Field(s) | Mapping Rule |
| --- | --- | --- | --- |
| HOTEL NAMES | hotels | hotel_name | Copy as hotel display name and join key across sheets. |
| INFORMATION | hotels | information_raw, total_rooms | Store original text in information_raw. If it starts with a clean integer like `29 Room`, parse total_rooms = 29. If irregular like `32 and 40 Room` or `27 Oda`, keep total_rooms null. |
| CONTACT | hotels | contact_raw, contact_name, contact_phone | Store original text in contact_raw. Extract contact_phone as text. Extract contact_name only if a probable person name exists before the number. |
| LOCATION | hotels | location_raw | Copy raw location string. Required field. |
| E-Mail ADDRESS | hotels | email | Copy as text if present. |
| ROOM TYPES | hotel_room_categories | room_name, room_category | Split multiple room labels on `-` only when clearly used as a room-name separator. Insert one row per label with exact room_name preserved. Infer room_category using keyword matching: economy, standard, deluxe, superior, executive, classic, suite, queen, twin, french, city view, sea view, small single, else unknown. |
| PRICES | hotel_room_categories | price_raw, base_price, currency_code, occupancy_code, occupancy_type | Preserve full text in price_raw. Extract numeric amount into base_price. Map `TL` to `TRY`. Extract occupancy_code like `DBL-SNG` or `TRP`. Map `DBL-SNG` and `SNG-DBL` to `single_double`, `TRP` to `triple`, otherwise `unknown`. |
| HOTEL LINK | hotels | hotel_link | Copy original hotel website link. |
| STAR RATINGS | hotels | star_rating, property_label_raw | If a clean integer between 1 and 5 exists, store it in star_rating. If the value contains text like `Hostel 3`, preserve the full source in property_label_raw and store the numeric rating only if safe. |
| HOTEL AMENITIES | amenity_types, hotel_amenities | amenity_types.name, hotel_amenities(hotel_id, amenity_type_id) | Split on commas, trim whitespace, deduplicate, upsert amenity_types, then insert join rows. |
| HOTEL DESCRIPTON | hotels | hotel_description | Copy as freeform description text. |
| CHECK IN AND CHECK OUT | hotels | check_in_out_raw, check_in_time, check_out_time | Preserve full text in check_in_out_raw. Parse time values like `14:00` and `12:00` into check_in_time and check_out_time when safely detected. |

## Child Pet Smoking Policies

| Excel Column | Target Table | Target Field(s) | Mapping Rule |
| --- | --- | --- | --- |
| HOTEL NAMES | hotels | hotel_name | Join sheet rows to hotels by hotel name. |
| CHILD POLICY | hotels | child_policy | Copy text to hotel policy field. |
| PET POLICY | hotels | pet_policy | Copy text to hotel policy field. |
| SMOKING POLICY | hotels | smoking_policy | Copy text to hotel policy field. |

## Google Map Links

| Excel Column | Target Table | Target Field(s) | Mapping Rule |
| --- | --- | --- | --- |
| HOTEL NAMES | hotels | hotel_name | Join sheet rows to hotels by hotel name. |
| GOOGLE MAP LINK | hotels | google_maps_link | Copy text to google_maps_link. |

## Parsing Notes

- Keep raw source text whenever parsing is unreliable or ambiguous.
- Do not store amenities as a comma-separated field in the final schema.
- Do not collapse room categories into the hotels table.
- Do not use JSONB for core hotel, room, amenity, policy, or map fields.

## Worked Examples

### Wings Hotel Pera

- ROOM TYPES: `Standard Double And Single room`
- PRICES: `DBL-SNG 4231 TL`

Expected hotel_room_categories row:

| Field | Value |
| --- | --- |
| room_name | Standard Double And Single room |
| room_category | standard |
| occupancy_code | DBL-SNG |
| occupancy_type | single_double |
| base_price | 4231.00 |
| currency_code | TRY |
| price_raw | DBL-SNG 4231 TL |

### Evsen hotel

- ROOM TYPES: `Economy Room`
- PRICES: `TRP Room 7534 TL`

Expected hotel_room_categories row:

| Field | Value |
| --- | --- |
| room_name | Economy Room |
| room_category | economy |
| occupancy_code | TRP |
| occupancy_type | triple |
| base_price | 7534.00 |
| currency_code | TRY |
| price_raw | TRP Room 7534 TL |
