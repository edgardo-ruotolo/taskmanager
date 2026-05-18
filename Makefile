.PHONY: dev stop

stop:
	-lsof -ti:5209 | xargs kill -9 2>/dev/null
	-lsof -ti:5173 | xargs kill -9 2>/dev/null

dev: stop
	cd backend && ~/.dotnet/dotnet run &
	cd frontend && pnpm dev
