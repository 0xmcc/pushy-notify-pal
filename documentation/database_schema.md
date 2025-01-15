create table
  public.matches (
    id uuid not null default gen_random_uuid (),
    player1_did text not null,
    player2_did text null,
    winner_did text null,
    loser_did text null,
    player1_move text null,
    player2_move text null,
    player1_move_timestamp timestamp with time zone null,
    player2_move_timestamp timestamp with time zone null,
    expiration_date timestamp with time zone not null default (now() + '24:00:00'::interval),
    stake_amount numeric not null,
    status text not null default 'pending'::text,
    player1_claimed_at timestamp with time zone null,
    player2_claimed_at timestamp with time zone null,
    winner_rating_change integer null,
    loser_rating_change integer null,
    is_ranked boolean null default true,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    player1_hidden boolean null,
    player2_hidden boolean null,
    constraint matches_pkey primary key (id),
    constraint matches_loser_did_fkey foreign key (loser_did) references users (did),
    constraint matches_player1_did_fkey foreign key (player1_did) references users (did),
    constraint matches_player2_did_fkey foreign key (player2_did) references users (did),
    constraint matches_winner_did_fkey foreign key (winner_did) references users (did)
  ) tablespace pg_default;

create index if not exists matches_players_idx on public.matches using btree (player1_did, player2_did) tablespace pg_default;

create index if not exists matches_status_idx on public.matches using btree (status) tablespace pg_default;

create trigger update_stats_on_match_complete
after
update of status on matches for each row when (
  new.status = 'completed'::text
  and old.status <> 'completed'::text
)
execute function update_player_stats ();

create table
  public.users (
    did text not null,
    rating integer not null default 1200,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    display_name text null,
    avatar_url text null,
    wallet_address text null,
    matches_played integer null default 0,
    matches_won integer null default 0,
    matches_lost integer null default 0,
    matches_drawn integer null default 0,
    off_chain_balance numeric null default 0,
    rock_count integer not null default 5,
    paper_count integer not null default 5,
    scissors_count integer not null default 5,
    web_push_subscription jsonb null,
    safari_push_subscription jsonb null,
    constraint users_pkey primary key (did),
    constraint unique_wallet_address unique (wallet_address)
  ) tablespace pg_default;

create index if not exists users_display_name_idx on public.users using gin (to_tsvector('english'::regconfig, display_name)) tablespace pg_default;
