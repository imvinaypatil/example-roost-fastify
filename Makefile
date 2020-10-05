SUBDIRS = fastify-backend fastify-frontend
all: dockerise undeploy deploy
	${MAKE} clean

build:
	for d in $(SUBDIRS); do echo "<==> Target: $@ for $$d <==>"; $(MAKE) -C $$d $@; echo "========="; done

dockerise:
	for d in $(SUBDIRS); do echo "<==> Target: $@ for $$d <==>"; $(MAKE) -C $$d $@; echo "========="; done

deploy:
	for d in $(SUBDIRS); do echo "<==> Target: $@ for $$d <==>"; $(MAKE) -C $$d $@; echo "========="; done

undeploy:
	for d in $(SUBDIRS); do echo "<==> Target: $@ for $$d <==>"; $(MAKE) -C $$d $@; echo "========="; done

clean:
	for d in $(SUBDIRS); do echo "<==> Target: $@ for $$d <==>"; $(MAKE) -C $$d $@; echo "========="; done
