# Yappio web client

This is the source of the web client running at https://yappio.chat. It is a fork of the Stoat web client ([stoatchat/for-web](https://github.com/stoatchat/for-web), tag 0.15.3) with my own branding, a redesigned interface and a Discover page for finding servers and bots.

Yappio is not affiliated with or endorsed by the Stoat project. The original project description is kept in [README.stoat.md](./README.stoat.md).

## License

The code is licensed under AGPL-3.0, the same license as upstream. See [LICENSE](./LICENSE). If you run a modified copy as a service, the license requires you to offer your users the source of your changes.

The Yappio name, logo and wordmark in `packages/client/public/assets` are mine and are not licensed for use as your own branding.

## Building

The build is the upstream one: `pnpm install --frozen-lockfile`, then the Dockerfile in this directory. The private upstream brand asset submodule is not needed; `packages/client/scripts/assets_fallback` is used instead.
