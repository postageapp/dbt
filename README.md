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

To restore from the most recent snapshot, based on timestamp on file:

    dbt --restore

To restore from a specific snapshot:

    dbt --restore db/snapshots/my_database.dump

By default the snapshots are stored in `db/snapshots` but they can be saved
anywhere if the path is specified.

To find out what configuration is being used:

    dbt --info

To find out what configuration is being used in a particular environment:

    dbt --env test --info

## Configuration

The connection configuration is read from `config/` in the form of a
`database.yml` ([Ruby on Rails](http://rubyonrails.com/)) or
`database.json` ([Sequelize](http://sequelizejs.com/)) file.

## Notes

Often saving and restoring PostgreSQL database snapshots takes a little work
to get things to line up correctly. `dbt` should handle most of that for you.

The ownership is automatically changed to whatever `username` is defined in
the database configuration.

## Copyright

(C) 2014 Scott Tadman, The Working Group Inc. and other contributors.

Using the [MIT License](http://opensource.org/licenses/MIT) as described in
the [`LICENSE`](LICENSE) file.
