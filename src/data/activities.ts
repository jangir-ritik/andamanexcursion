// import { Activity } from "@/components/atoms/ActivitySelect/ActivitySelect.types";
// import image1 from "@public/images/activities/activitiesList/1.png";
// import image2 from "@public/images/activities/activitiesList/2.png";
// import image3 from "@public/images/activities/activitiesList/3.png";
// import image4 from "@public/images/activities/activitiesList/4.png";

// /**
//  * Extended activity interface with additional display properties
//  */
// export interface ActivityData extends Activity {
//   image: any; // Image import
//   imageAlt: string;
//   description: string;
//   rating: number;
// }

// /**
//  * Master list of all activities
//  * This is the single source of truth for activities in the application
//  */
// export const ACTIVITIES_DATA: ActivityData[] = [
//   {
//     id: "scuba-diving",
//     name: "Scuba Diving",
//     image: image3,
//     imageAlt: "Scuba diving in clear waters",
//     description: "Discover the underwater world with professional guidance",
//     rating: 4.7,
//     slug: "scuba-diving",
//     value: "scuba-diving",
//     label: "Scuba Diving",
//   },
//   {
//     id: "snorkeling",
//     name: "Snorkeling",
//     image: image1,
//     imageAlt: "Snorkeling in coral gardens",
//     description: "Explore the vibrant coral gardens and marine life",
//     rating: 4.8,
//     slug: "snorkeling",
//     value: "snorkeling",
//     label: "Snorkeling",
//   },
//   {
//     id: "sea-walk",
//     name: "Sea Walk",
//     image: image2,
//     imageAlt: "Sea walking experience",
//     description: "Walk on the ocean floor and experience marine life up close",
//     rating: 4.6,
//     slug: "sea-walk",
//     value: "sea-walk",
//     label: "Sea Walk",
//   },
//   {
//     id: "glass-bottom-boat",
//     name: "Glass Bottom Boat",
//     image: image4,
//     imageAlt: "Glass bottom boat tour",
//     description:
//       "View marine life from the comfort of a boat with a glass bottom",
//     rating: 4.5,
//     slug: "glass-bottom-boat",
//     value: "glass-bottom-boat",
//     label: "Glass Bottom Boat",
//   },
//   {
//     id: "jet-ski",
//     name: "Jet Ski",
//     image: image4,
//     imageAlt: "Jet skiing across blue waters",
//     description: "Experience the thrill of riding on the ocean",
//     rating: 4.7,
//     slug: "jet-ski",
//     value: "jet-ski",
//     label: "Jet Ski",
//   },
//   {
//     id: "parasailing",
//     name: "Parasailing",
//     image: image2,
//     imageAlt: "Parasailing over blue waters",
//     description: "Experience the thrill of flying over the ocean",
//     rating: 4.9,
//     slug: "parasailing",
//     value: "parasailing",
//     label: "Parasailing",
//   },
//   {
//     id: "night-snorkeling",
//     name: "Night Snorkeling",
//     image: image3,
//     imageAlt: "Night snorkeling adventure",
//     description: "Explore the underwater world at night",
//     rating: 4.5,
//     slug: "night-snorkeling",
//     value: "night-snorkeling",
//     label: "Night Snorkeling",
//   },
//   {
//     id: "tandem-parasailing",
//     name: "Tandem Parasailing",
//     image: image2,
//     imageAlt: "Tandem parasailing",
//     description:
//       "Experience the thrill of flying over the ocean with a partner",
//     rating: 4.8,
//     slug: "tandem-parasailing",
//     value: "tandem-parasailing",
//     label: "Tandem Parasailing",
//   },
//   {
//     id: "advanced-scuba",
//     name: "Advanced Scuba",
//     image: image1,
//     imageAlt: "Advanced scuba diving",
//     description:
//       "Experience the thrill of deep sea diving for certified divers",
//     rating: 4.9,
//     slug: "advanced-scuba",
//     value: "advanced-scuba",
//     label: "Advanced Scuba",
//   },
//   {
//     id: "group-snorkeling",
//     name: "Group Snorkeling",
//     image: image4,
//     imageAlt: "Group snorkeling experience",
//     description: "Explore the coral gardens with a group of friends",
//     rating: 4.6,
//     slug: "group-snorkeling",
//     value: "group-snorkeling",
//     label: "Group Snorkeling",
//   },
//   {
//     id: "deep-sea-diving",
//     name: "Deep Sea Diving",
//     image: image1,
//     imageAlt: "Deep sea diving expedition",
//     description: "Experience the thrill of deep sea diving",
//     rating: 4.9,
//     slug: "deep-sea-diving",
//     value: "deep-sea-diving",
//     label: "Deep Sea Diving",
//   },
// ];

// /**
//  * Basic activity list for form selection
//  * Derived from the master list
//  */
// export const ACTIVITIES: Activity[] = ACTIVITIES_DATA.map(
//   ({ id, name, slug, value, label }) => ({
//     id,
//     name,
//     slug,
//     value,
//     label,
//   })
// );
