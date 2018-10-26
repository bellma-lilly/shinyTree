library(shiny)
library(shinyTree)

#' Examples of using jstree types to define node attributes
#' @author Michael Bell \email{bellma@@lilly.com}
shinyServer(function(input, output, session) {
  log <- c(paste0(Sys.time(), ": Interact with the tree to see the logs here..."))
  
  treeData <- reactive({
    list(
      root1 = structure("", stselected=TRUE,sttype="root"),
      root2 = structure(list(
        SubListA = structure(list(
            leaf1 = structure("",sttype="file",stid="1 leaf"), 
            leaf2 = structure("",sttype="file",stid="2 leaf"),
            leaf3 = structure("",sttype="file",stid="3 leaf")),
            sttype="root",stopened=TRUE
            ),
        SubListB = structure(list(
          leafA = structure("",sttype="file",stid="A leaf"),
          leafB = structure("",sttype="file",extradaata = "123")
          ),stopened=TRUE,sttype="root")
      ),
      sttype="root",stopened=TRUE
    )
  )
  })
  
  observeEvent(input$updateTree,{
    updateTree(session, treeId = "tree", data = treeData())
  })
  
  #don't use renderTree
  output$tree <- renderEmptyTree()
  observe({    updateTree(session, treeId = "tree", data = treeData()) })

  observe({
    req(input$tree)
    print(input$tree)
  })
})
