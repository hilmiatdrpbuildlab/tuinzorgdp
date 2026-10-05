# Media

Originals live in one private bucket, `media`, in [Neon Object Storage](https://neon.com/docs/storage/overview), reached with the AWS S3 SDK. Visitors never load from the bucket: the build copies each image into the static output as resized WebP files. The rules are the same as for TNL; this page repeats them and adds the photos visitors send with a quote.

## Content photos (CMS uploads)

1. The client picks a photo in `ImageField`, `GalleryEditor` or the media library.
2. The browser scales it to at most 2400 px on the long side and re-encodes it as JPEG at quality 85. That also strips EXIF data, including the GPS location of the customers' gardens.
   Accepted: JPEG, PNG and WebP up to 10 MB before scaling. Anything else gets a Dutch message: *"Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP."* No SVG, no HEIC from a desktop.
3. `POST /admin/api/media` checks the session, sniffs the type from the bytes, checks the scaled size, stores the file at `originals/<uuid>.jpg` and writes a `media` row with width, height and alt text. The alt field is in the upload dialog, with the design system's rule as hint: *beschrijf wat je ziet*.
4. The editor saves the content row; the same transaction rewrites its `media_usages`.
5. At build time `scripts/build-images.ts` downloads every image in use and writes 480, 960, 1600 and 2400 px WebP variants to `static/media/` with `sharp`. `MediaSlot` gets `srcset`, `sizes` per slot (see `design-system/guide/5-cms.md`), width, height and `object-position` from the focal point.
6. Gallery ratios come from each photo's width and height, snapped to 3:4, 4:5, 1:1, 4:3 or 2:3, so the masonry staggers without anyone choosing ratios.

### Deleting unused files (the cost rule)

- **On save:** when a save drops a file from `media_usages` and no other row uses it, the server deletes the object, then its `media` row. Replacing a photo deletes the old one.
- **On delete:** deleting a project, service photo, review or social post removes its usages, then applies the same check to each file it used.
- **Daily sweep:** the Worker cron at 03:00 deletes files unused for more than 24 hours (uploads abandoned before a save).
- The media library shows each file's usages. Deleting a file that is still used is refused, with the list of places that use it.

## Request photos (visitor uploads)

The quote form takes up to five photos of the visitor's garden. They are handled apart from content media:

- The browser scales each photo to 2000 px and JPEG 80 before sending, which also strips EXIF. Without JavaScript the form still works, but the server refuses photos over 10 MB each and 25 MB in total.
- `/api/submit` sniffs the type, stores the file at `requests/<request-uuid>/<n>.jpg`, and writes `request_files` rows. Request photos never get a `media` row, never appear in the build, and the `tz_build` role cannot read their table.
- In **Aanvragen** the CMS shows them through a short-lived signed URL (5 minutes), generated per view.
- They are deleted with the request: when the client deletes it, and by the 12-month retention cron.
- If storing a photo fails, the request still goes through; the notification mail says how many photos could not be saved.

## Notes for the team

- Object Storage is in beta. Keep every call behind `src/lib/server/storage.ts`, so moving to Cloudflare R2 means only a new endpoint and new credentials.
- **Weekly safety copy.** `.github/workflows/media-mirror.yml` (Sundays 04:00) runs `rclone sync` from the Neon bucket to the R2 bucket `tz-media-mirror` on DRP BuildLab's Cloudflare account. It mirrors `originals/` only; request photos are personal data and stay out of the mirror.
- **Limits on Neon Free:** 5 GB of storage and 5 GB of egress a month per project. The 45 launch photos are about 30 MB as originals; a publish downloads every image in use, so 200 photos is roughly 150 MB per build. Watch egress in the Neon console; if it becomes the constraint, cache the generated variants in R2 between builds.
- Set `forcePathStyle: true` on the S3 client, as Neon's docs require.
- Buckets branch with the database. A preview branch sees production files copy-on-write, and deletes there do not touch production.
