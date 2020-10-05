all:  dockerise undeploy deploy
	${MAKE} clean

dockerise:
	@docker build -f Dockerfile -t fastify-frontend:latest .
	${shell pwd}/../../push_image.sh fastify-frontend:latest

deploy:
	@kubectl apply -f fastify-frontend.yaml

.PHONY: undeploy
undeploy:
	@kubectl delete -f fastify-frontend.yaml >/dev/null 2>&1 || true

clean:
	- rm -f fastify-frontend
