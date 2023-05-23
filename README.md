# attic-action

![github actions badge](https://github.com/icewind1991/attic-action/workflows/attic-action%20test/badge.svg)

Github action to use [attic](https://github.com/zhaofengli/attic) for caching.

## Usage

- Setup an attic cache [as normal](https://docs.attic.rs/tutorial.html)
- Add your attic auth token as a secret to your repo
- Add a step to your ci:

```yaml
- uses: icewind1991/attic-action@v1
  with:
    name: cache-name
    instance: https://cache.example.com
    authToken: '${{ secrets.ATTIC_TOKEN }}'
```
