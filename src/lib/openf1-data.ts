import { openF1Fetch } from "./openf1";
import { raceStatus } from "./utils";

export type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_code: string;
  country_name: string;
  country_flag: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_image: string;
  circuit_info_url?: string;
  date_start: string;
  date_end: string;
  year: number;
  is_cancelled: boolean;
};

export type OpenF1Session = {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_name: string;
  location: string;
  year: number;
  is_cancelled: boolean;
};

export type OpenF1Driver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string | null;
};

export type ChampionshipDriver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  position_start: number;
  position_current: number;
  points_start: number;
  points_current: number;
};

export type ChampionshipTeam = {
  meeting_key: number;
  session_key: number;
  team_name: string;
  position_start: number;
  position_current: number;
  points_start: number;
  points_current: number;
};

export type SessionResult = {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number | number[] | null;
  gap_to_leader: number | string | number[] | null;
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
};

export type StartingGrid = {
  position: number;
  driver_number: number;
  lap_duration: number | null;
  meeting_key: number;
  session_key: number;
};

export type Lap = {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  st_speed: number | null;
  session_key: number;
  meeting_key: number;
};

export type Weather = {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  wind_direction: number;
  date: string;
  meeting_key: number;
  session_key: number;
};

export type RaceControlMessage = {
  category: string;
  date: string;
  driver_number?: number | null;
  flag?: string | null;
  lap_number?: number | null;
  message: string;
  meeting_key: number;
  session_key: number;
};

export type Stint = {
  compound: string;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
};

export type RaceItem = {
  id: string;
  raceNumber: number;
  meetingKey: number;
  name: string;
  officialName: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  circuit: string;
  circuitType: string;
  circuitImage: string;
  city: string;
  date: string;
  startTimeUtc: string;
  endTimeUtc: string;
  year: number;
  status: "Completed" | "Upcoming" | "Live";
};

export type DriverStanding = OpenF1Driver & {
  id: string;
  color: string;
  position: number;
  positionStart: number;
  points: number;
  pointsStart: number;
  change: number;
};

export type DriverSeason = {
  year: number;
  position: number;
  points: number;
  pointsStart: number;
};

export type TeamStanding = ChampionshipTeam & {
  id: string;
  color: string;
  code: string;
  drivers: DriverStanding[];
};

export type TeamSeason = {
  year: number;
  position: number;
  points: number;
  pointsStart: number;
};

export type HomeData = {
  races: RaceItem[];
  nextRace: RaceItem;
  remainingRaces: RaceItem[];
  latestRaceSession: OpenF1Session;
  drivers: DriverStanding[];
  teams: TeamStanding[];
  fastestLap?: { driverCode: string; duration: number; lap: number; sessionKey: number };
};

export type RaceDetailData = {
  race: RaceItem;
  sessions: OpenF1Session[];
  raceSession?: OpenF1Session;
  drivers: Array<Pick<OpenF1Driver, "driver_number" | "name_acronym">>;
  dataYear: number;
  dataRaceName: string;
  usingPreviousYear: boolean;
  weather?: Weather;
  results: SessionResult[];
  startingGrid: StartingGrid[];
  fastestLaps: Array<{ driverNumber: number; driverCode: string; duration: number; lap: number; teamColor: string }>;
  stints: Stint[];
  raceControl: RaceControlMessage[];
  recentWinners: Array<{
    year: number;
    driverNumber: number;
    driverCode: string;
    driverName: string;
    teamName: string;
    teamColor: string;
  }>;
};

const YEAR = 2026;

function slugify(value: string) {
  return value.toLowerCase().replace(/grand prix/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || value.toLowerCase();
}

function teamCode(name: string) {
  if (name === "Red Bull Racing") return "RBR";
  if (name === "Racing Bulls") return "VCARB";
  if (name === "Aston Martin") return "AMR";
  if (name === "Haas F1 Team") return "Haas";
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 4).toUpperCase();
}

function color(value?: string | null) {
  return value ? `#${value.replace("#", "")}` : "#e10600";
}

function normalizeCircuitType(value: string) {
  if (/street/i.test(value)) return "Street";
  if (/road/i.test(value)) return "Road";
  return "Permanent";
}

function toRaceItem(meeting: OpenF1Meeting, raceNumber: number): RaceItem {
  return {
    id: slugify(meeting.meeting_name),
    raceNumber,
    meetingKey: meeting.meeting_key,
    name: meeting.meeting_name,
    officialName: meeting.meeting_official_name,
    country: meeting.country_name,
    countryCode: meeting.country_code,
    countryFlag: meeting.country_flag,
    circuit: meeting.circuit_short_name,
    circuitType: normalizeCircuitType(meeting.circuit_type),
    circuitImage: meeting.circuit_image,
    city: meeting.location,
    date: meeting.date_start.slice(0, 10),
    startTimeUtc: meeting.date_start,
    endTimeUtc: meeting.date_end,
    year: meeting.year,
    status: raceStatus(meeting.date_start),
  };
}

async function pause() {
  await new Promise((resolve) => setTimeout(resolve, 400));
}

export async function getRaceMeetings() {
  const meetings = await openF1Fetch<OpenF1Meeting[]>(`/meetings?year=${YEAR}`, 900);
  return meetings
    .filter((meeting) => !meeting.is_cancelled && !/testing/i.test(meeting.meeting_name))
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .map((meeting, index) => toRaceItem(meeting, index + 1));
}

export async function getHomeData(): Promise<HomeData> {
  const races = await getRaceMeetings();
  await pause();
  const latestRaceSession = (await openF1Fetch<OpenF1Session[]>("/sessions?session_key=latest", 120))[0];
  await pause();
  const championshipDrivers = await openF1Fetch<ChampionshipDriver[]>("/championship_drivers?session_key=latest", 120);
  await pause();
  const openDrivers = await openF1Fetch<OpenF1Driver[]>("/drivers?session_key=latest", 120);
  await pause();
  const championshipTeams = await openF1Fetch<ChampionshipTeam[]>("/championship_teams?session_key=latest", 120);
  await pause();
  const laps = await openF1Fetch<Lap[]>("/laps?session_key=latest", 120);

  const driverByNumber = new Map(openDrivers.map((driver) => [driver.driver_number, driver]));
  const drivers: DriverStanding[] = championshipDrivers
    .flatMap((standing) => {
      const driver = driverByNumber.get(standing.driver_number);
      if (!driver) return [];
      return [{
        ...driver,
        id: slugify(driver.full_name),
        color: color(driver.team_colour),
        position: standing.position_current,
        positionStart: standing.position_start,
        points: standing.points_current,
        pointsStart: standing.points_start,
        change: standing.position_start - standing.position_current,
      }];
    })
    .sort((a, b) => a.position - b.position);

  const teams = championshipTeams
    .map((team) => ({
      ...team,
      id: slugify(team.team_name),
      color: color(drivers.find((driver) => driver.team_name === team.team_name)?.team_colour),
      code: teamCode(team.team_name),
      drivers: drivers.filter((driver) => driver.team_name === team.team_name),
    }))
    .sort((a, b) => a.position_current - b.position_current);

  const fastest = laps
    .filter((lap) => typeof lap.lap_duration === "number")
    .sort((a, b) => (a.lap_duration ?? Infinity) - (b.lap_duration ?? Infinity))[0];
  const fastestDriver = fastest ? driverByNumber.get(fastest.driver_number) : undefined;
  const fastestLap = fastest && fastestDriver ? { driverCode: fastestDriver.name_acronym, duration: fastest.lap_duration as number, lap: fastest.lap_number, sessionKey: fastest.session_key } : undefined;

  const nextRace = races.find((race) => race.status !== "Completed") ?? races[races.length - 1];
  return {
    races,
    nextRace,
    remainingRaces: races.filter((race) => race.status !== "Completed"),
    latestRaceSession,
    drivers,
    teams,
    fastestLap,
  };
}

async function getRaceSessionForYear(year: number, race: RaceItem) {
  const meetings = await openF1Fetch<OpenF1Meeting[]>(`/meetings?year=${year}`, 900);
  const sorted = meetings
    .filter((meeting) => !meeting.is_cancelled && !/testing/i.test(meeting.meeting_name))
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  const meeting =
    sorted.find((item) => item.country_code === race.countryCode && item.circuit_short_name === race.circuit) ??
    sorted.find((item) => slugify(item.meeting_name) === race.id || item.country_code === race.countryCode);
  if (!meeting) return null;
  await pause();
  const sessions = await openF1Fetch<OpenF1Session[]>(`/sessions?meeting_key=${meeting.meeting_key}`, 300);
  const raceSession = sessions.find((session) => session.session_type === "Race" && session.session_name === "Race");
  if (!raceSession) return null;
  return { race: toRaceItem(meeting, sorted.findIndex((item) => item.meeting_key === meeting.meeting_key) + 1), sessions, raceSession };
}

type DriverLookup = Pick<OpenF1Driver, "driver_number" | "name_acronym" | "team_colour">;

async function getSessionPayload(sessionKey: number, fallbackDrivers: DriverLookup[] = []) {
  const [results, startingGrid, laps] = await Promise.all([
    openF1Fetch<SessionResult[]>(`/session_result?session_key=${sessionKey}`, 180).catch(() => []),
    openF1Fetch<StartingGrid[]>(`/starting_grid?session_key=${sessionKey}`, 180).catch(() => []),
    openF1Fetch<Lap[]>(`/laps?session_key=${sessionKey}`, 180).catch(() => []),
  ]);
  await pause();
  const [stints, weatherRows, raceControl] = await Promise.all([
    openF1Fetch<Stint[]>(`/stints?session_key=${sessionKey}`, 180).catch(() => []),
    openF1Fetch<Weather[]>(`/weather?session_key=${sessionKey}`, 180).catch(() => []),
    openF1Fetch<RaceControlMessage[]>(`/race_control?session_key=${sessionKey}`, 180).catch(() => []),
  ]);
  await pause();
  let sessionDrivers = await openF1Fetch<OpenF1Driver[]>(`/drivers?session_key=${sessionKey}`, 180).catch(() => []);

  if (!sessionDrivers.length) {
    const meetingKey = laps[0]?.meeting_key ?? results[0]?.meeting_key ?? startingGrid[0]?.meeting_key;
    if (meetingKey) {
      await pause();
      sessionDrivers = await openF1Fetch<OpenF1Driver[]>(`/drivers?meeting_key=${meetingKey}`, 180).catch(() => []);
    }
  }

  const fastestByDriver = new Map<number, Lap>();
  for (const lap of laps) {
    if (typeof lap.lap_duration !== "number") continue;
    const current = fastestByDriver.get(lap.driver_number);
    if (!current || (lap.lap_duration ?? Infinity) < (current.lap_duration ?? Infinity)) {
      fastestByDriver.set(lap.driver_number, lap);
    }
  }
  const driverFor = (number: number) =>
    sessionDrivers.find((driver) => driver.driver_number === number) ??
    fallbackDrivers.find((driver) => driver.driver_number === number);
  const codeFor = (number: number) => driverFor(number)?.name_acronym ?? String(number);
  const teamColorFor = (number: number) => color(driverFor(number)?.team_colour);
  const fastestLaps = [...fastestByDriver.values()]
    .sort((a, b) => (a.lap_duration ?? Infinity) - (b.lap_duration ?? Infinity))
    .slice(0, 8)
    .map((lap) => ({
      driverNumber: lap.driver_number,
      driverCode: codeFor(lap.driver_number),
      duration: lap.lap_duration as number,
      lap: lap.lap_number,
      teamColor: teamColorFor(lap.driver_number),
    }));

  return {
    drivers: sessionDrivers.map((driver) => ({ driver_number: driver.driver_number, name_acronym: driver.name_acronym })),
    weather: weatherRows.at(-1),
    results: results.sort((a, b) => a.position - b.position),
    startingGrid: startingGrid.sort((a, b) => a.position - b.position),
    fastestLaps,
    stints,
    raceControl: raceControl.slice(-8).reverse(),
  };
}

async function getRecentTrackWinners(race: RaceItem, limit = 3) {
  const winners: RaceDetailData["recentWinners"] = [];
  for (let year = race.year; year >= 2023 && winners.length < limit; year -= 1) {
    await pause();
    const meetings = await openF1Fetch<OpenF1Meeting[]>(`/meetings?year=${year}`, 900).catch(() => []);
    const sorted = meetings
      .filter((meeting) => !meeting.is_cancelled && !/testing/i.test(meeting.meeting_name))
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    const meeting =
      sorted.find((item) => item.country_code === race.countryCode && item.circuit_short_name === race.circuit) ??
      sorted.find((item) => item.country_code === race.countryCode);
    if (!meeting) continue;

    await pause();
    const sessions = await openF1Fetch<OpenF1Session[]>(`/sessions?meeting_key=${meeting.meeting_key}`, 300).catch(() => []);
    const raceSession = sessions.find((session) => session.session_type === "Race" && session.session_name === "Race");
    if (!raceSession) continue;

    await pause();
    const [winner] = await openF1Fetch<SessionResult[]>(`/session_result?session_key=${raceSession.session_key}&position=1`, 180).catch(() => []);
    if (!winner) continue;

    await pause();
    const [driver] = await openF1Fetch<OpenF1Driver[]>(`/drivers?session_key=${raceSession.session_key}&driver_number=${winner.driver_number}`, 180).catch(() => []);
    winners.push({
      year,
      driverNumber: winner.driver_number,
      driverCode: driver?.name_acronym ?? String(winner.driver_number),
      driverName: driver?.full_name ?? `Driver ${winner.driver_number}`,
      teamName: driver?.team_name ?? "Unknown team",
      teamColor: color(driver?.team_colour),
    });
  }
  return winners;
}

export async function getRaceDetail(id: string): Promise<RaceDetailData | null> {
  const homeData = await getHomeData();
  const aliases: Record<string, string> = {
    australia: "australian",
    china: "chinese",
    japan: "japanese",
    canada: "canadian",
    monaco: "monaco",
    austria: "austrian",
    britain: "british",
    belgium: "belgian",
    hungary: "hungarian",
    netherlands: "dutch",
    italy: "italian",
    mexico: "mexico-city",
    brazil: "sao-paulo",
    qatar: "qatar",
    "abu-dhabi": "abu-dhabi",
  };
  const target = aliases[id] ?? id;
  const race = homeData.races.find((item) => item.id === target || String(item.meetingKey) === id);
  if (!race) return null;

  await pause();
  const sessions = await openF1Fetch<OpenF1Session[]>(`/sessions?meeting_key=${race.meetingKey}`, 300);
  const raceSession = sessions.find((session) => session.session_type === "Race" && session.session_name === "Race");
  if (!raceSession) {
    const previousRace = race.year === YEAR ? await getRaceSessionForYear(YEAR - 1, race) : null;
    if (previousRace) {
      await pause();
      const previousPayload = await getSessionPayload(previousRace.raceSession.session_key, homeData.drivers);
      if (previousPayload.results.length || previousPayload.startingGrid.length || previousPayload.fastestLaps.length || previousPayload.stints.length) {
        const recentWinners = await getRecentTrackWinners(race);
        return {
          race,
          sessions,
          raceSession: previousRace.raceSession,
          drivers: previousPayload.drivers.length ? previousPayload.drivers : homeData.drivers,
          dataYear: previousRace.race.year,
          dataRaceName: previousRace.race.name,
          usingPreviousYear: true,
          weather: previousPayload.weather,
          results: previousPayload.results,
          startingGrid: previousPayload.startingGrid,
          fastestLaps: previousPayload.fastestLaps,
          stints: previousPayload.stints,
          raceControl: previousPayload.raceControl,
          recentWinners,
        };
      }
    }
    const recentWinners = await getRecentTrackWinners(race);
    return { race, sessions, drivers: homeData.drivers, dataYear: race.year, dataRaceName: race.name, usingPreviousYear: false, results: [], startingGrid: [], fastestLaps: [], stints: [], raceControl: [], recentWinners };
  }

  await pause();
  let payload = await getSessionPayload(raceSession.session_key, homeData.drivers);
  let dataYear = race.year;
  let dataRaceName = race.name;
  let usingPreviousYear = false;

  if (!payload.results.length && race.year === YEAR) {
    const previousRace = await getRaceSessionForYear(YEAR - 1, race);
    if (previousRace) {
      await pause();
      const previousPayload = await getSessionPayload(previousRace.raceSession.session_key, homeData.drivers);
      if (previousPayload.results.length || previousPayload.startingGrid.length || previousPayload.fastestLaps.length) {
        payload = previousPayload;
        dataYear = previousRace.race.year;
        dataRaceName = previousRace.race.name;
        usingPreviousYear = true;
      }
    }
  }

  const recentWinners = await getRecentTrackWinners(race);

  return {
    race,
    sessions,
    raceSession,
    drivers: payload.drivers.length ? payload.drivers : homeData.drivers,
    dataYear,
    dataRaceName,
    usingPreviousYear,
    weather: payload.weather,
    results: payload.results,
    startingGrid: payload.startingGrid,
    fastestLaps: payload.fastestLaps,
    stints: payload.stints,
    raceControl: payload.raceControl,
    recentWinners,
  };
}

async function getFinalRaceSessionKey(year: number) {
  const sessions = await openF1Fetch<OpenF1Session[]>(`/sessions?year=${year}&session_type=Race`, 900).catch(() => []);
  const races = sessions
    .filter((session) => session.session_name === "Race")
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
  return races.at(-1)?.session_key;
}

export async function getDriverHistory(driverNumber: number): Promise<DriverSeason[]> {
  const home = await getHomeData();
  const current = home.drivers.find((driver) => driver.driver_number === driverNumber);
  const history: DriverSeason[] = current ? [{ year: YEAR, position: current.position, points: current.points, pointsStart: current.pointsStart }] : [];
  for (const year of [2025, 2024, 2023]) {
    await pause();
    const sessionKey = await getFinalRaceSessionKey(year);
    if (!sessionKey) continue;
    await pause();
    const rows = await openF1Fetch<ChampionshipDriver[]>(`/championship_drivers?session_key=${sessionKey}&driver_number=${driverNumber}`, 900).catch(() => []);
    const row = rows[0];
    if (row) history.push({ year, position: row.position_current, points: row.points_current, pointsStart: row.points_start });
  }
  return history;
}

export async function getTeamHistory(teamName: string): Promise<TeamSeason[]> {
  const home = await getHomeData();
  const current = home.teams.find((team) => team.team_name === teamName);
  const history: TeamSeason[] = current ? [{ year: YEAR, position: current.position_current, points: current.points_current, pointsStart: current.points_start }] : [];
  for (const year of [2025, 2024, 2023]) {
    await pause();
    const sessionKey = await getFinalRaceSessionKey(year);
    if (!sessionKey) continue;
    await pause();
    const rows = await openF1Fetch<ChampionshipTeam[]>(`/championship_teams?session_key=${sessionKey}&team_name=${encodeURIComponent(teamName)}`, 900).catch(() => []);
    const row = rows[0];
    if (row) history.push({ year, position: row.position_current, points: row.points_current, pointsStart: row.points_start });
  }
  return history;
}

export async function getDriverById(id: string) {
  const data = await getHomeData();
  return data.drivers.find((driver) => driver.id === id || String(driver.driver_number) === id);
}

export async function getTeamById(id: string) {
  const data = await getHomeData();
  return data.teams.find((team) => team.id === id || team.team_name.toLowerCase() === id.toLowerCase());
}
