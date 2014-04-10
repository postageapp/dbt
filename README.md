# dbt
                             ________
        _ _    _        ____//______\\_____
     __| | |__| |_     /__________________/|
    | _  |  _ |  _|    |     |______|    | |
    |____|____|___|    |_________________|/

## Usage

The `dbt` command makes it easy to connect to your database, create snapshots
and restore from these at a later time.

To connect to the database:

    dbt

To create a snapshot:

    dbt --snapshot

To restore from the most recent snapshot:

    dbt --restore

To restore from a specific snapshot:

    dbt --restore --file=db/snapshots/my_database.dump

## Caveats

This is a very early version of the tool.

## Copyright

(C) 2014 Scott Tadman, The Working Group Inc. and other contributors.

Using the [MIT License](http://opensource.org/licenses/MIT) as described in
the [`LICENSE`](LICENSE) file.